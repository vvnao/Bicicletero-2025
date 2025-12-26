import { useNavigate } from 'react-router-dom';
import '../styles/RegisterSelector.css';
import { ArrowLeft } from "lucide-react";

export default function RegisterSelector() {
  const navigate = useNavigate();

  return (
    <div className='register-selector-container'>
      <h2 className='register-selector-title'>¿Qué tipo de persona eres?</h2>

      <div className='register-selector-grid'>
        <div
          onClick={() => navigate('/auth/register/student')}
          className='register-selector-card'
        >
          <div className='register-selector-card-title'>Estudiante</div>
          <div className='register-selector-card-description'>
            Usuario con matrícula activa en la institución
          </div>
        </div>

        <div
          onClick={() => navigate('/auth/register/academic')}
          className='register-selector-card'
        >
          <div className='register-selector-card-title'>Académico</div>
          <div className='register-selector-card-description'>
            Profesor, investigador o personal académico
          </div>
        </div>

        <div
          onClick={() => navigate('/auth/register/assistant')}
          className='register-selector-card'
        >
          <div className='register-selector-card-title'>Funcionario</div>
          <div className='register-selector-card-description'>
            Personal administrativo o de apoyo
          </div>
        </div>
      </div>

      <div
        onClick={() => navigate('/auth/login')}
        className='back-button'
      >
        <ArrowLeft size={24} color="white" /> 
      </div>
    </div>
  );
}
