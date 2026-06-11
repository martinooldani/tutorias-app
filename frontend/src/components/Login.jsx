import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [errorServidor, setErrorServidor] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid }
    } = useForm();

    const onSubmit = async (data) => {
        try {
            setErrorServidor(null);
            await login(data.email, data.password);
            navigate('/turnos', { replace: true });
        } catch (error) {
            setErrorServidor(
                error.response?.data?.error || 'Error al iniciar sesión'
            );
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.titulo}>Iniciar sesión</h2>

                <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

                    <div style={styles.campo}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            style={styles.input}
                            {...register('email', {
                                required: 'El email es obligatorio',
                                pattern: {
                                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,4}$/i,
                                    message: 'Ingresá un email válido'
                                }
                            })}
                        />
                        {errors.email && <p style={styles.error}>{errors.email.message}</p>}
                    </div>

                    <div style={styles.campo}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            style={styles.input}
                            {...register('password', {
                                required: 'La contraseña es obligatoria'
                            })}
                        />
                        {errors.password && <p style={styles.error}>{errors.password.message}</p>}
                    </div>

                    {errorServidor && <p style={styles.error}>{errorServidor}</p>}

                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        style={styles.boton}
                    >
                        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                    </button>

                </form>

                <p style={styles.registro}>
                    ¿No tenés cuenta? <Link to="/register">Registrarse</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f7fafc' },
    card: { backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
    titulo: { marginBottom: '24px', textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    campo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    input: { padding: '8px 12px', border: '1px solid #cbd5e0', borderRadius: '4px', fontSize: '1rem' },
    error: { color: '#e53e3e', fontSize: '0.85rem', margin: '4px 0 0 0' },
    boton: { padding: '10px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', marginTop: '8px' },
    registro: { textAlign: 'center', marginTop: '16px' }
};

export default Login;