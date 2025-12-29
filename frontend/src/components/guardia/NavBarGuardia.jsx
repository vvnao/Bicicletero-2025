'use strict';

const NavBarGuardia = ({ sidebarHover }) => {
  return (
    <header
      style={{
        height: '70px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 30px',
        zIndex: 999,
        color: '#ffffff',
        borderBottom: '0.3px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        background: 'rgba(39,46,75,0.95)',
        transition: 'margin-left 0.3s ease',
      }}
    >
      <div
        style={{
          marginLeft: sidebarHover ? '250px' : '90px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500' }}>
            Sistema de Bicicleteros UBB
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '13px', fontWeight: '500' }}>Guardia</div>
        </div>

        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, rgba(90,120,223,0.8), rgba(50,57,84,0.8))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '500',
            border: '2px solid rgba(255,255,255,0.15)',
          }}
        >
          G
        </div>
      </div>
    </header>
  );
};

export default NavBarGuardia;
