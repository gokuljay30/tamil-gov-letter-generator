const rows = {
  na: [
    ["n", "ன", "van → வன்"],
    ["N", "ண", "peN → பெண்"],
    ["nh", "ந", "nha → ந; nhaa → நா"]
  ],
  ra: [
    ["r", "ர", "ira → இர"],
    ["R", "ற", "iRa → இற; maaRu → மாறு"]
  ],
  la: [
    ["l", "ல", "il → இல்"],
    ["L", "ள", "iL → இள்; paLLi → பள்ளி"],
    ["zh", "ழ", "pazham → பழம்; vazhi → வழி"]
  ],
  vowel: [
    ["a / aa", "க / கா", "ka / kaa"],
    ["i / ii", "கி / கீ", "ki / kii"],
    ["u / uu", "கு / கூ", "ku / kuu"],
    ["e / E", "கெ / கே", "ke / kE"],
    ["o / O", "கொ / கோ", "ko / kO"]
  ]
} as const;

function HelpTable({ title, description, entries }: { title: string; description: string; entries: ReadonlyArray<readonly [string, string, string]> }) {
  return <section className="help-card">
    <h2>{title}</h2>
    <p>{description}</p>
    <div className="help-table-wrap">
      <table className="help-table">
        <thead><tr><th>Type</th><th>தமிழ் எழுத்து</th><th>உதாரணம்</th></tr></thead>
        <tbody>{entries.map(([typing, tamil, example]) => <tr key={typing}><td><code>{typing}</code></td><td className="help-tamil-letter">{tamil}</td><td>{example}</td></tr>)}</tbody>
      </table>
    </div>
  </section>;
}

export default function HelpPage() {
  return <main className="content-page help-page">
    <header className="page-header">
      <h1>உதவி</h1>
      <p>Tanglish எழுத்து → தமிழ் பயன்படுத்துவதற்கான எளிய வழிகாட்டி</p>
    </header>

    <aside className="help-note">
      முதலில் வேண்டிய உரையை English எழுத்துகளில் டைப் செய்யவும். பின்னர் <b>Tanglish எழுத்து → தமிழ்</b> பொத்தானை அழுத்தி, மாற்றப்பட்ட உரையைச் சரிபார்த்து ஏற்றுக்கொள்ளவும். பெரிய எழுத்தான <code>N</code>, <code>R</code>, <code>L</code> ஆகியவை வேறு தமிழ் எழுத்துகளை உருவாக்கும்.
    </aside>

    <div className="help-grid">
      <HelpTable title="மூன்று ‘ன’ எழுத்துகள்" description="இரண்டு சுழி ன, மூன்று சுழி ண மற்றும் நகர ந ஆகியவற்றை இவ்வாறு வேறுபடுத்தவும்." entries={rows.na} />
      <HelpTable title="ர மற்றும் ற" description="சாதாரண ர-க்கு சிறிய r; வல்லின ற-க்கு பெரிய R பயன்படுத்தவும்." entries={rows.ra} />
      <HelpTable title="ல, ள மற்றும் ழ" description="மூன்று ஒத்த ஒலிகளுக்கும் தனித்தனி Tanglish குறியீடுகள் உள்ளன." entries={rows.la} />
      <HelpTable title="குறில் மற்றும் நெடில்" description="நெடில் ஒலிக்கு எழுத்தை இருமுறை எழுதவும். எ/ஏ மற்றும் ஒ/ஓ வேறுபாட்டிற்கு பெரிய E/O பயன்படுத்தவும்." entries={rows.vowel} />
    </div>

    <section className="help-card help-examples">
      <h2>விரைவான உதாரணங்கள்</h2>
      <div><code>kaalnadai</code><span>→</span><b>கால்நடை</b></div>
      <div><code>maruthuvamanai</code><span>→</span><b>மருத்துவமனை</b></div>
      <div><code>peN</code><span>→</span><b>பெண்</b></div>
      <div><code>pazham</code><span>→</span><b>பழம்</b></div>
      <div><code>maaRu</code><span>→</span><b>மாறு</b></div>
    </section>
  </main>;
}
