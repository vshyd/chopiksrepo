import { useState } from 'react'
import './Register.css'
import logo from './assets/logo.svg'

/**
 * Registration page component (prototype - not connected to API)
 * Styled to match the main app design
 */
function Register({ onRegister, onBackToLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'analyst'
    })
    const [errors, setErrors] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Available roles for the user to select
    const roles = [
        { value: 'analyst', label: 'Market Analyst', description: 'Financial and market analysis focus' },
        { value: 'technical', label: 'Technical Specialist', description: 'Technology and infrastructure focus' },
        { value: 'regulatory', label: 'Regulatory Affairs', description: 'Compliance and policy focus' },
        { value: 'executive', label: 'Executive', description: 'High-level strategic overview' },
        { value: 'general', label: 'General User', description: 'All categories of news' }
    ]

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required'
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores'
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number'
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        // Role validation
        if (!formData.role) {
            newErrors.role = 'Please select a role'
        }

        return newErrors
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const newErrors = validateForm()

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // In a real app, this would call the API
        console.log('Registration data:', {
            username: formData.username,
            role: formData.role
        })

        // Simulate successful registration
        alert(`Account created successfully!\n\nUsername: ${formData.username}\nRole: ${roles.find(r => r.value === formData.role)?.label}`)

        // Call parent callback if provided
        if (onRegister) {
            onRegister(formData)
        }
    }

    return (
        <div className="register-app">
            {/* Header matching main app */}
            <header className="app-header">
                <button
                    className="icon-button back-button"
                    onClick={onBackToLogin}
                    aria-label="Back to app"
                >
                    ←
                </button>
                <h1 className="register-header-title">Create Account</h1>
                <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
            </header>

            {/* Main content area */}
            <div className="register-content">
                <div className="register-intro">
                    <h2 className="register-title">
                        Join <img src={logo} alt="scout.io" className="register-title-logo" />
                    </h2>
                    <p className="register-subtitle">Set up your personalized news feed based on your role</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form" noValidate>
                    {/* Username Field */}
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-input ${errors.username ? 'input-error' : ''}`}
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                        {errors.username && (
                            <span className="error-message">{errors.username}</span>
                        )}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-input ${errors.password ? 'input-error' : ''}`}
                                placeholder="Enter your password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && (
                            <span className="error-message">{errors.password}</span>
                        )}
                        <span className="form-hint">
                            At least 8 characters with uppercase, lowercase, and number
                        </span>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <div className="password-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <span className="error-message">{errors.confirmPassword}</span>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div className="form-group">
                        <label className="form-label">
                            Select Your Role
                        </label>
                        <p className="form-hint" style={{ marginTop: '4px', marginBottom: '12px' }}>
                            Your role determines which news categories you'll see
                        </p>
                        <div className="role-options">
                            {roles.map(role => (
                                <label
                                    key={role.value}
                                    className={`role-card ${formData.role === role.value ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role.value}
                                        checked={formData.role === role.value}
                                        onChange={handleChange}
                                        className="role-radio"
                                    />
                                    <div className="role-content">
                                        <span className="role-label">{role.label}</span>
                                        <span className="role-description">{role.description}</span>
                                    </div>
                                    <div className="role-checkmark">✓</div>
                                </label>
                            ))}
                        </div>
                        {errors.role && (
                            <span className="error-message">{errors.role}</span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="register-submit-button">
                        Create Account
                    </button>

                    {/* Back to Login Link */}
                    <div className="register-footer">
                        <p className="footer-text">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={onBackToLogin}
                                className="footer-link"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register

