-- Layout rules for CV.md, applied by build_cv.py. Each rule is general, so a new
-- entry written the same way as its neighbours picks up the same layout.
--
--  1. A newline inside a paragraph is a real line break. The source puts the
--     role, the unit, and the dates of an entry on separate lines; letting
--     markdown join them ran the unit into the role mid-sentence.
--  2. A line ending in " · <date>" sets the date in a fixed right-hand column,
--     so wrapped text never runs underneath a date.
--  3. A paragraph that reads as a reference (Surname, X. ... (YYYY) gets a
--     hanging indent.
--  4. Everything before the first section heading is the header: centered.
--  5. Markdown "---" rules are dropped; every section heading carries its own.
--  6. No line break inside a date range or before a "·" separator.
--  7. A bare path such as github.com/org/repo may break after a "/".

local NBSP = "\u{A0}"
local MONTH = "%u%l%l"
local function word(el) return el and el.t == "Str" and el.text or nil end
local function is_date(s)
  s = s:gsub(NBSP, " "):gsub("^%s+", ""):gsub("%s+$", "")
  local pats = {
    "^%d%d%d%d$",
    "^" .. MONTH .. " %d%d%d%d$",
    "^" .. MONTH .. " %d%d%d%d – " .. MONTH .. " %d%d%d%d$",
    "^" .. MONTH .. " %d%d%d%d – present$",
    "^%d%d%d%d – %d%d%d%d$",
    "^%d%d%d%d – present$",
  }
  for _, p in ipairs(pats) do
    if s:match(p) then return true end
  end
  return false
end

local function latex(inlines)
  local out = pandoc.write(pandoc.Pandoc({ pandoc.Plain(inlines) }), "latex")
  return (out:gsub("%s+$", ""))
end

-- Split a paragraph's inlines into lines at every soft or hard break.
local function split_lines(inlines)
  local lines, cur = {}, pandoc.Inlines({})
  for _, el in ipairs(inlines) do
    if el.t == "SoftBreak" or el.t == "LineBreak" then
      table.insert(lines, cur)
      cur = pandoc.Inlines({})
    else
      cur:insert(el)
    end
  end
  table.insert(lines, cur)
  return lines
end

-- If a line ends "<text> · <date>", return the text inlines and the date.
local function split_date(line)
  for i = #line, 1, -1 do
    local el = line[i]
    if el.t == "Str" and el.text == "·" then
      local tail = pandoc.utils.stringify(pandoc.Inlines({ table.unpack(line, i + 1) }))
      if is_date(tail) then
        local head = pandoc.Inlines({ table.unpack(line, 1, i - 1) })
        while #head > 0 and (head[#head].t == "Space" or word(head[#head]) == NBSP) do
          head:remove(#head)
        end
        return head, (tail:gsub(NBSP, "~"):gsub("^[%s~]+", ""))
      end
      return nil
    end
  end
  return nil
end

local function is_reference(text)
  return text:match("^[%u][^,]-, %u%.") and text:match("%(%d%d%d%d")
end

-- Rule 6: never break a line inside a date or before a separator. A space
-- becomes non-breaking when it sits before "–" or "·", after "–" ahead of a
-- date word, between a month or term and its year, or inside a course code
-- such as "MC 451".
local DATE_WORDS = {
  Jan=1, Feb=1, Mar=1, Apr=1, May=1, Jun=1, Jul=1, Aug=1, Sep=1, Sept=1,
  Oct=1, Nov=1, Dec=1, Spring=1, Summer=1, Fall=1, present=1,
}
local function bare(w) return w and (w:gsub("^%p+", ""):gsub("%p+$", "")) or nil end

local function Inlines(inl)
  for i = 2, #inl - 1 do
    if inl[i].t == "Space" then
      local prev, nxt = word(inl[i - 1]), word(inl[i + 1])
      local glue = prev and nxt and (
        nxt:match("^–") or nxt:match("^·") or
        (prev == "–" and (DATE_WORDS[bare(nxt)] or nxt:match("^%d%d%d%d"))) or
        (DATE_WORDS[bare(prev)] and nxt:match("^%d%d%d%d")) or
        (bare(prev):match("^%u%u%u?$") and nxt:match("^%d%d%d")))
      if glue then inl[i] = pandoc.Str(NBSP) end
    end
  end
  -- Rule 7: a bare path such as github.com/org/repo may break after a "/".
  -- Full URLs ("https://...") are links and already break at "/" via \url.
  local out = pandoc.Inlines({})
  for _, el in ipairs(inl) do
    if el.t == "Str" and el.text:match("%w%.%w+/%w") and not el.text:match("://") then
      local first = true
      for piece in el.text:gmatch("[^/]*/?") do
        if piece ~= "" then
          if not first then out:insert(pandoc.RawInline("latex", "\\allowbreak{}")) end
          out:insert(pandoc.Str(piece))
          first = false
        end
      end
    else
      out:insert(el)
    end
  end
  return out
end

local seen_header = false

local function Para(el)
  local lines = split_lines(el.content)
  local dated = false
  for _, line in ipairs(lines) do
    if split_date(line) then dated = true end
  end

  if dated or #lines > 1 then
    local parts = {}
    for _, line in ipairs(lines) do
      local head, date = split_date(line)
      if head then
        table.insert(parts, "\\cvdated{" .. latex(head) .. "}{" .. date .. "}")
      else
        table.insert(parts, "\\cvline{" .. latex(line) .. "}")
      end
    end
    return pandoc.RawBlock("latex",
      "\\cvstart\n" .. table.concat(parts, "\n") .. "\n\\cvend")
  end

  if seen_header and is_reference(pandoc.utils.stringify(el)) then
    el.content:insert(1, pandoc.RawInline("latex", "\\cvhang{}"))
    return el
  end
  return nil
end

function Pandoc(doc)
  local blocks = pandoc.Blocks({})
  local header = pandoc.Blocks({})
  for _, b in ipairs(doc.blocks) do
    if b.t == "HorizontalRule" then
      -- dropped (rule 5)
    elseif not seen_header and b.t ~= "Header" then
      header:insert(b)
    else
      if not seen_header then
        seen_header = true
        blocks:insert(pandoc.RawBlock("latex", "\\begin{cvheader}"))
        blocks:insert(pandoc.RawBlock("latex", "\\cvname{" .. latex(doc.meta.title) ..
          "}{" .. latex(doc.meta.subtitle) .. "}"))
        blocks:extend(header)
        blocks:insert(pandoc.RawBlock("latex", "\\end{cvheader}"))
      end
      blocks:insert(b)
    end
  end
  doc.blocks = blocks
  -- The name block is set by \cvname; keep pandoc's \maketitle out of it.
  doc.meta.title = nil
  doc.meta.subtitle = nil
  return doc:walk({ Inlines = Inlines }):walk({ Para = Para })
end
