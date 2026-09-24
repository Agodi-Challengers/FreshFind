import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import Icon from '../components/Icon.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { asset } from '../lib/assets.js';
import './AuthPage.css';

/**
 * Login / Sign up (Figma: 09 Login / Sign up · Desktop).
 * SRS: dummy login/signup for design continuity. Nothing is stored or sent.
 */
export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { markets } = useData();
  const [showPw, setShowPw] = useState(false);
  const [weekly, setWeekly] = useState(true);
  const signup = mode === 'signup';

  const submit = (e) => {
    e.preventDefault();
    toast('Demo only: accounts aren’t stored in this version.');
  };

  const input = (id, label, icon, props = {}) => (
    <div className="ff-auth__field">
      <label htmlFor={id}>{label}</label>
      <span className="ff-auth__input">
        <Icon name={icon} size={16} />
        <input id={id} {...props} />
        {props.type === 'password' || id === 'a-pw' ? (
          <button type="button" aria-label={showPw ? 'Hide password' : 'Show password'} onClick={() => setShowPw((v) => !v)}>
            <Icon name={showPw ? 'eye' : 'eye-off'} size={16} />
          </button>
        ) : null}
      </span>
    </div>
  );

  return (
    <div className="ff-auth">
      <div className="ff-auth__photo">
        <img src={asset('/images/site/auth.webp')} alt="" />
        <div className="ff-auth__photo-top">
          <Logo variant="light" />
        </div>
        <div className="ff-auth__quote">
          <p>Plan your market day in minutes. See who’s open, what’s in season, and keep your list in one place.</p>
          <span>Free to use · {markets.length} Lagos markets</span>
        </div>
      </div>

      <main className="ff-auth__side" id="main">
        <div className="ff-auth__card">
          <button type="button" className="ff-auth__back ff-icon-text" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}>
            <Icon name="arrow-left" size={15} />
            Back to FreshFind
          </button>

          <nav className="ff-auth__tabs" aria-label="Account">
            <Link to="/login" aria-current={!signup ? 'page' : undefined}>
              Log in
            </Link>
            <Link to="/signup" aria-current={signup ? 'page' : undefined}>
              Sign up
            </Link>
          </nav>

          <div className="ff-auth__head">
            <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
            <p>{signup ? 'Save markets, add notes and get weekly seasonal picks.' : 'Log in to see your saved markets and notes.'}</p>
          </div>

          <form className="ff-auth__form" onSubmit={submit}>
            {signup && input('a-name', 'Full name', 'user', { type: 'text', placeholder: 'Ada Okafor', autoComplete: 'name' })}
            {input('a-email', 'Email', 'mail', { type: 'email', placeholder: 'ada@example.com', autoComplete: 'email' })}
            {input('a-pw', 'Password', 'lock', {
              type: showPw ? 'text' : 'password',
              placeholder: 'At least 8 characters',
              autoComplete: signup ? 'new-password' : 'current-password',
            })}
            {signup && input('a-area', 'Your area', 'map-pin', { type: 'text', placeholder: 'Lekki, Lagos', autoComplete: 'address-level2' })}
            {signup && (
              <label className="ff-auth__check">
                <input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} />
                <span aria-hidden="true" className={weekly ? 'is-on' : ''} />
                Email me this week’s seasonal picks
              </label>
            )}
            <button type="submit" className="ff-btn ff-btn--primary ff-btn--lg ff-btn--block">
              {signup ? 'Create account' : 'Log in'}
            </button>
            <div className="ff-auth__or" aria-hidden="true">
              <span>or</span>
            </div>
            <button type="button" className="ff-btn ff-btn--outline ff-btn--lg ff-btn--block ff-auth__google" onClick={submit}>
              <span className="ff-auth__g" aria-hidden="true">
                G
              </span>
              Continue with Google
            </button>
            <p className="ff-auth__demo" role="note">
              <Icon name="info" size={15} />
              Demo only: accounts aren’t stored in this version.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
