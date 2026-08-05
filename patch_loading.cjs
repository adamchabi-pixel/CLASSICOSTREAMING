const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  if (!asyncData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black select-none pointer-events-none">
        <div className="relative overflow-hidden flex items-center">
          <span className="font-cinzel font-bold text-3xl sm:text-4xl md:text-5xl tracking-[0.22em] gold-metallic-text uppercase leading-none">
            CLASSICO
          </span>
        </div>
        <span className="block font-signature text-xl sm:text-2xl md:text-3xl text-[#f4ecd8] leading-none mt-[-2px] sm:mt-[-4px] select-none text-center translate-x-[-3px] filter drop-shadow-[0_0_4px_rgba(244,236,216,0.2)]">
          The Best
        </span>
        <div className="flex gap-2 mt-8 items-center justify-center">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#fcf6ba", boxShadow: "0 0 10px rgba(252, 246, 186, 0.8)", animation: "illuminate 1.5s infinite ease-in-out both", animationDelay: "0s" }}></div>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#fcf6ba", boxShadow: "0 0 10px rgba(252, 246, 186, 0.8)", animation: "illuminate 1.5s infinite ease-in-out both", animationDelay: "-1.0s" }}></div>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#fcf6ba", boxShadow: "0 0 10px rgba(252, 246, 186, 0.8)", animation: "illuminate 1.5s infinite ease-in-out both", animationDelay: "-0.5s" }}></div>
        </div>
        <style>
          {\`
            @keyframes illuminate { 0%, 100% { opacity: 0.2; transform: scale3d(0.8, 0.8, 1); } 50% { opacity: 1; transform: scale3d(1.2, 1.2, 1); } }
          \`}
        </style>
      </div>
    );
  }`;

const replacement = `  if (!asyncData) {
    return (
      <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'100vh',backgroundColor:'#000',pointerEvents:'none',userSelect:'none'}}>
        <div style={{position:'relative',overflow:'hidden',display:'flex',alignItems:'center'}}>
          <span style={{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:'1.875rem',letterSpacing:'0.22em',textTransform:'uppercase',lineHeight:1,background:'linear-gradient(135deg, #bf953f 0%, #fcf6ba 15%, #b38728 35%, #fbf5b7 55%, #aa771c 75%, #fcf6ba 90%, #bf953f 100%)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
            CLASSICO
          </span>
        </div>
        <span style={{fontFamily:"'Pinyon Script',cursive",display:'block',fontSize:'1.25rem',color:'#f4ecd8',lineHeight:1,marginTop:'-2px',userSelect:'none',textAlign:'center',transform:'translateX(-3px)',filter:'drop-shadow(0 0 4px rgba(244,236,216,0.2))'}}>
          The Best
        </span>
        <div style={{display:'flex',gap:'8px',marginTop:'32px'}}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#fcf6ba',boxShadow:'0 0 10px rgba(252,246,186,0.8)',animation:'illuminate 1.5s infinite ease-in-out both',animationDelay:'0s'}}></div>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#fcf6ba',boxShadow:'0 0 10px rgba(252,246,186,0.8)',animation:'illuminate 1.5s infinite ease-in-out both',animationDelay:'-1.0s'}}></div>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'#fcf6ba',boxShadow:'0 0 10px rgba(252,246,186,0.8)',animation:'illuminate 1.5s infinite ease-in-out both',animationDelay:'-0.5s'}}></div>
        </div>
      </div>
    );
  }`;

file = file.replace(target, replacement);
fs.writeFileSync('src/App.tsx', file);
console.log("Replaced loading screen");
