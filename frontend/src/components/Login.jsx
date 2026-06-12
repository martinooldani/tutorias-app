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
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-card__title">Iniciar sesión</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="form">

                    <div className="field">
                        <label className="field__label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            {...register('email', {
                                required: 'El email es obligatorio',
                                pattern: {
                                    value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,4}$/i,
                                    message: 'Ingresá un email válido'
                                }
                            })}
                        />
                        {errors.email && <p className="field__error">{errors.email.message}</p>}
                    </div>

                    <div className="field">
                        <label className="field__label" htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            {...register('password', {
                                required: 'La contraseña es obligatoria'
                            })}
                        />
                        {errors.password && <p className="field__error">{errors.password.message}</p>}
                    </div>

                    {errorServidor && <p className="form-error">{errorServidor}</p>}

                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="btn btn--primary"
                    >
                        {isSubmitting ? 'Ingresando...' : 'Ingresar'}
                    </button>

                </form>

                <p className="auth-card__footer">
                    ¿No tenés cuenta? <Link to="/register">Registrarse</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;