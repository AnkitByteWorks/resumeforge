export function HeroBubbles({ variant = 'auth' }: { variant?: 'auth' | 'app' }) {
  const isAuth = variant === 'auth'

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#09090b]">
      {/* 
        Hum 'border' aur 'box-shadow' ka use kar rahe hain solid background ke bajaye.
        Isse hollow glass ring ka effect aata hai.
      */}

      {/* Ring 1: Large Orange (Top Right) */}
      <div
        className="absolute rounded-full animate-bubble-slow mix-blend-screen"
        style={{
          top: isAuth ? '-10%' : '-20%',
          right: isAuth ? '10%' : '-5%',
          width: isAuth ? '45vw' : '35vw',
          height: isAuth ? '45vw' : '35vw',
          border: '1.5px solid rgba(251, 146, 60, 0.6)', // Sharp glowing edge
          background: 'radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.1) 0%, transparent 60%)', // Very faint inner glow
          boxShadow: `
            inset 0 0 40px rgba(251, 146, 60, 0.2),
            inset 10px 10px 20px rgba(255, 255, 255, 0.1),
            0 0 30px rgba(251, 146, 60, 0.2)
          `,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Ring 2: Large Cyan/Blue (Bottom Right) */}
      <div
        className="absolute rounded-full animate-bubble-medium mix-blend-screen"
        style={{
          bottom: isAuth ? '0%' : '-10%',
          right: isAuth ? '5%' : '10%',
          width: isAuth ? '40vw' : '30vw',
          height: isAuth ? '40vw' : '30vw',
          border: '1.5px solid rgba(6, 182, 212, 0.6)',
          background: 'radial-gradient(circle at 70% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)',
          boxShadow: `
            inset 0 0 40px rgba(6, 182, 212, 0.2),
            inset -10px -10px 20px rgba(255, 255, 255, 0.1),
            0 0 30px rgba(6, 182, 212, 0.2)
          `,
          backdropFilter: 'blur(2px)',
          animationDelay: '1s',
        }}
      />

      {/* Ring 3: Purple/Magenta (Center Overlapping) */}
      <div
        className="absolute rounded-full animate-bubble-slow mix-blend-screen"
        style={{
          top: isAuth ? '25%' : '10%',
          right: isAuth ? '30%' : '20%',
          width: isAuth ? '35vw' : '25vw',
          height: isAuth ? '35vw' : '25vw',
          border: '1px solid rgba(168, 85, 247, 0.7)',
          background: 'radial-gradient(circle at 40% 20%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
          boxShadow: `
            inset 0 0 30px rgba(168, 85, 247, 0.3),
            inset 5px 5px 15px rgba(255, 255, 255, 0.2),
            0 0 20px rgba(168, 85, 247, 0.2)
          `,
          backdropFilter: 'blur(1px)',
          animationDelay: '2s',
        }}
      />

      {/* Ring 4: Small Lime/Green Accent (Overlapping right) */}
      <div
        className="absolute rounded-full animate-bubble-medium mix-blend-screen"
        style={{
          top: isAuth ? '45%' : '35%',
          right: isAuth ? '-2%' : '2%',
          width: isAuth ? '25vw' : '18vw',
          height: isAuth ? '25vw' : '18vw',
          border: '1.5px solid rgba(132, 204, 22, 0.7)',
          background: 'transparent',
          boxShadow: `
            inset 0 0 20px rgba(132, 204, 22, 0.4),
            inset -5px -5px 15px rgba(255, 255, 255, 0.2),
            0 0 25px rgba(132, 204, 22, 0.3)
          `,
          backdropFilter: 'blur(2px)',
          animationDelay: '3s',
        }}
      />

      {/* Ring 5: Darker/Twisted look ring (Top Left of cluster) */}
      <div
        className="absolute rounded-full animate-bubble-slow mix-blend-screen"
        style={{
          top: isAuth ? '5%' : '-5%',
          right: isAuth ? '45%' : '35%',
          width: isAuth ? '20vw' : '15vw',
          height: isAuth ? '20vw' : '15vw',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          background:
            'radial-gradient(circle at 50% 50%, transparent 60%, rgba(168, 85, 247, 0.2) 90%, rgba(168, 85, 247, 0.5) 100%)',
          boxShadow: `
            inset 0 0 20px rgba(255, 255, 255, 0.1),
            0 0 20px rgba(168, 85, 247, 0.2)
          `,
          backdropFilter: 'blur(1px)',
          animationDelay: '0.5s',
        }}
      />
    </div>
  )
}

export default HeroBubbles
