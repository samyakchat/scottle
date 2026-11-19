import { readFileSync } from 'node:fs'

const path = new URL('../public/conversations.jsonl', import.meta.url)
const rows = readFileSync(path, 'utf8').split(/\r?\n/).filter((row) => row.trim())
const dates = new Set()
let failures = 0
for (const [index, row] of rows.entries()) {
  const number = index + 1
  try {
    const item = JSON.parse(row)
    const fail = (message) => { console.error(`Line ${number}: ${message}`); failures++ }
    if (!item || typeof item !== 'object') { fail('entry must be an object'); continue }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || new Date(`${item.date}T00:00:00Z`).toISOString().slice(0, 10) !== item.date) fail('date must be a valid YYYY-MM-DD')
    if (dates.has(item.date)) fail(`duplicate date ${item.date}`); dates.add(item.date)
    if (typeof item.title !== 'string' || !item.title || !item.speakers?.a || !item.speakers?.b || !Array.isArray(item.lines)) { fail('required fields are missing'); continue }
    if (item.lines.length < 12 || item.lines.length > 30) fail('line count must be between 12 and 30')
    let setups = 0
    for (let i = 0; i < item.lines.length; i++) {
      const line = item.lines[i]
      if (!Array.isArray(line) || !['a', 'b'].includes(line[0]) || typeof line[1] !== 'string' || !line[1]) { fail(`line ${i + 1} must have a speaker and text`); continue }
      if (line[2] === 1) { setups++; if (item.lines[i - 1]?.[2] === 1) fail(`setups on adjacent lines ${i} and ${i + 1}`) }
    }
    if (setups !== 5) fail(`expected exactly 5 setups, found ${setups}`)
  } catch (error) { console.error(`Line ${number}: invalid JSON (${error.message})`); failures++ }
}
if (failures) process.exitCode = 1
else console.log(`Validated ${rows.length} conversations.`)
