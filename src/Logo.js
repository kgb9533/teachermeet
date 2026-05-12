import React from 'react';

function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="140" height="140" rx="24" fill="white" stroke="#F4845F" strokeWidth="3"/>
      <path d="M70 125 C70 125 20 90 20 55 C20 35 33 24 47 27 C54 29 70 40 70 40 C70 40 86 29 93 27 C107 24 120 35 120 55 C120 90 70 125 70 125Z" fill="#FFF0EB"/>
      <rect x="16" y="34" width="50" height="64" rx="5" fill="#F4845F"/>
      <line x1="41" y1="34" x2="41" y2="98" stroke="white" strokeWidth="2.5"/>
      <line x1="20" y1="49" x2="39" y2="49" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <line x1="20" y1="58" x2="39" y2="58" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <line x1="20" y1="67" x2="39" y2="67" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <line x1="20" y1="76" x2="39" y2="76" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
      <text x="72" y="128" fontFamily="serif" fontSize="80" fontWeight="900" fill="#F4845F">T</text>
      <text x="108" y="142" fontFamily="serif" fontSize="44" fontWeight="700" fill="#FDBCAA">M</text>
    </svg>
  );
}

export default Logo;