'use client';

export function TrimestrProjectionSection() {
    return (
        <div className="bg-white rounded-2xl p-8 shadow-[0px_12px_32px_rgba(11,29,45,0.04)] border border-[#c1c6d7]/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h3 className="text-xl font-black text-[#0b1d2d] tracking-tight uppercase">
                    Proyección Trimestral de Demanda
                </h3>
                <div className="flex gap-2 bg-[#eef4ff] p-1 rounded-lg border border-[#c1c6d7]/20">
                    <select className="bg-transparent border-none text-xs font-bold text-[#0059bb] focus:ring-0 py-1">
                        <option>Alpha Manizales</option>
                    </select>
                    <input type="month" defaultValue="2024-11" className="bg-transparent border-none text-xs font-bold text-[#0059bb] focus:ring-0 py-1" />
                </div>
            </div>

            {/* Trimestral Chart SVG */}
            <div className="h-64 w-full relative mb-8">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 200">
                    {/* Confidence Interval Band (±10.7) */}
                    <path
                        d="M 0 100 L 500 60 L 1000 80 L 1000 130 L 500 110 L 0 150 Z"
                        fill="rgba(0, 89, 187, 0.08)"
                    ></path>

                    {/* media_historica reference line */}
                    <line x1="0" y1="130" x2="1000" y2="130" stroke="#c1c6d7" strokeDasharray="6,6" strokeWidth="1.5" />

                    {/* umbral_alerta reference line */}
                    <line x1="0" y1="60" x2="1000" y2="60" stroke="#ba1a1a" strokeDasharray="3,3" strokeWidth="1" />

                    {/* hospitalizaciones_predichas line */}
                    <path d="M 0 125 L 500 85 L 1000 105" fill="none" stroke="#0059bb" strokeWidth="2.5"></path>

                    {/* Data points colored by nivel_alerta */}
                    <g>
                        {/* Month 1: Green (Normal) */}
                        <circle cx="0" cy="125" fill="#4CAF50" r="5" stroke="#fff" strokeWidth="2"></circle>
                        <text x="-15" y="110" className="text-[10px] font-black fill-[#0b1d2d]">
                            142
                        </text>

                        {/* Month 2: Red (Critical) */}
                        <circle cx="500" cy="85" fill="#ba1a1a" r="6" stroke="#fff" strokeWidth="2"></circle>
                        <text x="485" y="70" className="text-[10px] font-black fill-[#ba1a1a]">
                            184
                        </text>

                        {/* Month 3: Orange (High) */}
                        <circle cx="1000" cy="105" fill="#9e3d00" r="5" stroke="#fff" strokeWidth="2"></circle>
                        <text x="980" y="90" className="text-[10px] font-black fill-[#9e3d00]">
                            165
                        </text>
                    </g>
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-[-32px] w-full flex justify-between px-2 text-[11px] font-black text-[#414754] uppercase tracking-tighter">
                    <span>Noviembre 2024</span>
                    <span>Diciembre 2024</span>
                    <span>Enero 2025</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-[#c1c6d7]/10">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#4CAF50]"></span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Normal</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#FFC107]"></span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Moderado</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#9e3d00]"></span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Alto</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ba1a1a]"></span>
                    <span className="text-[10px] font-bold uppercase opacity-60">Crítico</span>
                </div>
            </div>
        </div>
    );
}
