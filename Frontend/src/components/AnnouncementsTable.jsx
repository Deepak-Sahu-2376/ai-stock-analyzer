import React from 'react';

export default function AnnouncementsTable({ data, loading, onSelectStock }) {
  if (loading) {
    return (
      <div className="p-8 text-center text-on-surface-variant animate-pulse">
        Loading announcements...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-on-surface-variant">
        No announcements found.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mobile View (Cards) */}
      <div className="md:hidden divide-y divide-border-subtle/50 px-4 sm:px-6">
        {data.map((item, idx) => (
          <div key={idx} className="bg-white py-4">
            <div className="flex justify-between items-start mb-1.5">
              <div>
                <span 
                  className="font-bold text-sm text-primary cursor-pointer hover:underline"
                  onClick={() => onSelectStock && onSelectStock(item.symbol)}
                >
                  {item.symbol}
                </span>
                <div className="text-[11px] leading-tight text-on-surface-variant truncate w-48">{item.sm_name}</div>
              </div>
              <div className="text-[10px] text-on-surface-variant text-right whitespace-pre-line">
                {item.an_dt ? item.an_dt.replace(' ', '\n') : '-'}
              </div>
            </div>
            
            <div className="font-semibold text-xs mb-1 line-clamp-2">{item.desc}</div>
            <p className="text-[11px] leading-snug text-on-surface-variant mb-2 line-clamp-2">{item.attchmntText}</p>
            
            <div className="flex gap-3 items-center">
              {item.attchmntFile && item.attchmntFile.includes('http') && (
                <a href={item.attchmntFile} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-bold bg-red-50 px-2 py-1 rounded">
                  <span className="material-icons text-sm">picture_as_pdf</span> PDF
                </a>
              )}
              {item.xbrl && item.xbrl.includes('http') && (
                <a href={item.xbrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-700 font-bold bg-purple-50 px-2 py-1 rounded">
                  <span className="material-icons text-sm">code</span> XBRL
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View (Table) */}
      <div className="hidden md:block overflow-x-auto bg-white border-b-4 border-[#f1f1f1]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold border-y border-border-subtle">
              <th className="p-2 font-bold w-[10%]">Symbol</th>
              <th className="p-2 font-bold w-[15%]">Company Name</th>
              <th className="p-2 font-bold w-[20%]">Subject</th>
              <th className="p-2 font-bold w-[35%]">Details</th>
              <th className="p-2 text-center font-bold w-[5%]">Attachment</th>
              <th className="p-2 text-center font-bold w-[5%]">XBRL</th>
              <th className="p-2 font-bold text-right w-[10%]">Broadcast Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-[13px] text-on-surface">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                <td className="p-2 font-semibold align-top">
                  <span className="text-primary cursor-pointer hover:underline" onClick={() => onSelectStock && onSelectStock(item.symbol)}>
                    {item.symbol}
                  </span>
                </td>
                <td className="p-2 text-[#4a5568] text-xs align-top">{item.sm_name}</td>
                <td className="p-2 text-[#4a5568] align-top">
                  <div className="line-clamp-2" title={item.desc}>{item.desc}</div>
                </td>
                <td className="p-2 align-top">
                  <p className="text-xs text-[#4a5568] line-clamp-3">{item.attchmntText}</p>
                </td>
                <td className="p-2 text-center align-middle">
                  {item.attchmntFile && item.attchmntFile.includes('http') ? (
                    <a href={item.attchmntFile} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center text-red-500 hover:text-red-700 transition-colors" title="Download PDF">
                      <span className="material-icons text-2xl">picture_as_pdf</span>
                    </a>
                  ) : <span className="text-on-surface-variant">-</span>}
                </td>
                <td className="p-2 text-center align-middle">
                  {item.xbrl && item.xbrl.includes('http') ? (
                    <a href={item.xbrl} target="_blank" rel="noreferrer" className="inline-flex flex-col items-center text-purple-500 hover:text-purple-700 transition-colors" title="Download XBRL">
                      <span className="material-icons text-2xl">data_object</span>
                    </a>
                  ) : <span className="text-on-surface-variant">-</span>}
                </td>
                <td className="p-2 text-right align-top">
                  <span className="text-primary underline decoration-[#2b6cb0] text-[11px] whitespace-pre-line block leading-tight">
                    {item.an_dt ? item.an_dt.replace(' ', '\n') : '-'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
