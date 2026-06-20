import React, { memo, useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Eye, EyeOff, Shield, Sparkles, Code, Terminal, Users, Hash, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

// ==================== Input Component ====================

const Input = memo(
  forwardRef(function Input({ className, type, ...props }, ref) {
    const radius = 100; // change this to increase the radius of the hover effect
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
              #8b5cf6,
              transparent 80%
            )
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className='group/input rounded-xl p-[1px] transition duration-300'
      >
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border-none bg-zinc-950/40 px-3 py-2 text-sm text-white transition duration-400 group-hover/input:shadow-none placeholder:text-neutral-500 focus-visible:ring-[2px] focus-visible:ring-violet-500/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  })
);

Input.displayName = 'Input';

// ==================== BoxReveal Component ====================

const BoxReveal = memo(function BoxReveal({
  children,
  width = 'fit-content',
  boxColor,
  duration,
  overflow = 'hidden',
  position = 'relative',
  className,
}) {
  const mainControls = useAnimation();
  const slideControls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      slideControls.start('visible');
      mainControls.start('visible');
    } else {
      slideControls.start('hidden');
      mainControls.start('hidden');
    }
  }, [isInView, mainControls, slideControls]);

  return (
    <section
      ref={ref}
      style={{
        position,
        width,
        overflow,
      }}
      className={className}
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial='hidden'
        animate={mainControls}
        transition={{ duration: duration ?? 0.5, delay: 0.25 }}
      >
        {children}
      </motion.div>
      <motion.div
        variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
        initial='hidden'
        animate={slideControls}
        transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
        style={{
          position: 'absolute',
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          zIndex: 20,
          background: boxColor ?? '#8b5cf6',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== Ripple Component ====================

const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.12,
  numCircles = 8,
  className = '',
}) {
  return (
    <section
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 60;
        const opacity = mainCircleOpacity - i * 0.015;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';

        return (
          <span
            key={i}
            className='absolute animate-ripple rounded-full border border-violet-500/10'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: Math.max(0.01, opacity),
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </section>
  );
});

// ==================== OrbitingCircles Component ====================

const OrbitingCircles = memo(function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
}) {
  return (
    <>
      {path && (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          version='1.1'
          className='pointer-events-none absolute inset-0 size-full'
        >
          <circle
            className='stroke-white/5 stroke-1'
            cx='50%'
            cy='50%'
            r={radius}
            fill='none'
          />
        </svg>
      )}
      <section
        style={{
          '--duration': duration,
          '--radius': radius,
          '--delay': -delay,
        }}
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border border-white/5 bg-white/[0.01] [animation-delay:calc(var(--delay)*1000ms)]',
          { '[animation-direction:reverse]': reverse },
          className
        )}
      >
        {children}
      </section>
    </>
  );
});

// ==================== TechOrbitDisplay Component ====================

const TechOrbitDisplay = memo(function TechOrbitDisplay({
  iconsArray,
  text = 'StudyQuest OS',
}) {
  return (
    <section className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg'>
      <span className='pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-white to-gray-600 bg-clip-text text-center text-5xl font-extrabold leading-none text-transparent'>
        {text}
      </span>

      {iconsArray.map((icon, index) => (
        <OrbitingCircles
          key={index}
          className={icon.className}
          duration={icon.duration}
          delay={icon.delay}
          radius={icon.radius}
          path={icon.path}
          reverse={icon.reverse}
        >
          {icon.component()}
        </OrbitingCircles>
      ))}
    </section>
  );
});

// ==================== AnimatedForm Component ====================

const AnimatedForm = memo(function AnimatedForm({
  header,
  subHeader,
  fields,
  submitButton,
  textVariantButton,
  errorField,
  fieldPerRow = 1,
  onSubmit,
  googleLogin,
  goTo,
}) {
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const toggleVisibility = () => setVisible(!visible);

  const validateForm = (event) => {
    const currentErrors = {};
    fields.forEach((field) => {
      const value = event.target[field.label]?.value;

      if (field.required && !value) {
        currentErrors[field.label] = `${field.label} is required`;
      }

      if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
        currentErrors[field.label] = 'Invalid email address';
      }

      if (field.type === 'password' && value && value.length < 6) {
        currentErrors[field.label] = 'Password must be at least 6 characters long';
      }
    });
    return currentErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formErrors = validateForm(event);

    if (Object.keys(formErrors).length === 0) {
      onSubmit(event);
    } else {
      setErrors(formErrors);
    }
  };

  return (
    <section className='max-md:w-full flex flex-col gap-4 w-full max-w-sm mx-auto'>
      <BoxReveal boxColor='rgba(139,92,246,0.2)' duration={0.3}>
        <h2 className='font-extrabold text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-sans'>
          {header}
        </h2>
      </BoxReveal>

      {subHeader && (
        <BoxReveal boxColor='rgba(139,92,246,0.2)' duration={0.3} className='pb-2'>
          <p className='text-xs text-cyan-400 font-mono tracking-widest uppercase mt-0.5'>
            {subHeader}
          </p>
        </BoxReveal>
      )}

      {googleLogin && (
        <>
          <BoxReveal
            boxColor='rgba(139,92,246,0.2)'
            duration={0.3}
            overflow='visible'
            width='100%'
          >
            <button
              className='g-button group/btn bg-white/[0.01] hover:bg-white/[0.04] border border-white/10 w-full rounded-xl h-11 font-mono text-xs font-semibold outline-none hover:cursor-pointer transition-colors relative'
              type='button'
              onClick={() => alert('Mocking Google integration: connection synchronized.')}
            >
              <span className='flex items-center justify-center w-full h-full gap-3 text-gray-300'>
                <img
                  src='https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png'
                  width={22}
                  height={22}
                  alt='Google Icon'
                />
                {googleLogin}
              </span>
              <BottomGradient />
            </button>
          </BoxReveal>

          <BoxReveal boxColor='rgba(139,92,246,0.2)' duration={0.3} width='100%'>
            <section className='flex items-center gap-4 py-1'>
              <hr className='flex-1 border-1 border-dashed border-white/5' />
              <p className='text-gray-500 text-[10px] font-mono uppercase'>
                or
              </p>
              <hr className='flex-1 border-1 border-dashed border-white/5' />
            </section>
          </BoxReveal>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <section className={`grid grid-cols-1 md:grid-cols-${fieldPerRow} gap-4`}>
          {fields.map((field) => (
            <section key={field.label} className='flex flex-col gap-1.5'>
              <BoxReveal boxColor='rgba(139,92,246,0.2)' duration={0.3}>
                <Label htmlFor={field.label}>
                  {field.label} {field.required && <span className='text-rose-500'>*</span>}
                </Label>
              </BoxReveal>

              <BoxReveal
                width='100%'
                boxColor='rgba(139,92,246,0.2)'
                duration={0.3}
                className='flex flex-col space-y-1 w-full'
              >
                <section className='relative'>
                  <Input
                    type={
                      field.type === 'password'
                        ? visible
                          ? 'text'
                          : 'password'
                        : field.type
                    }
                    id={field.label}
                    name={field.label}
                    placeholder={field.placeholder}
                    onChange={field.onChange}
                  />

                  {field.type === 'password' && (
                    <button
                      type='button'
                      onClick={toggleVisibility}
                      className='absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-white transition-colors cursor-pointer'
                    >
                      {visible ? (
                        <Eye className='h-4.5 w-4.5' />
                      ) : (
                        <EyeOff className='h-4.5 w-4.5' />
                      )}
                    </button>
                  )}
                </section>

                <section className='h-4 min-h-[1rem]'>
                  {errors[field.label] && (
                    <p className='text-rose-400 text-[10px] font-mono'>
                      [CRITICAL]: {errors[field.label]}
                    </p>
                  )}
                </section>
              </BoxReveal>
            </section>
          ))}
        </section>

        <BoxReveal width='100%' boxColor='rgba(139,92,246,0.2)' duration={0.3}>
          {errorField && (
            <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] font-mono mb-2">
              <span className="font-bold uppercase mr-1">[CRITICAL ERROR]:</span> {errorField}
            </div>
          )}
        </BoxReveal>

        <BoxReveal
          width='100%'
          boxColor='rgba(139,92,246,0.2)'
          duration={0.3}
          overflow='visible'
        >
          <button
            className='bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 relative block w-full text-white rounded-xl h-11 font-mono text-xs font-semibold shadow-md active:scale-[0.98] outline-none hover:cursor-pointer transition-all border border-violet-500/20'
            type='submit'
          >
            {submitButton} &rarr;
            <BottomGradient />
          </button>
        </BoxReveal>

        {textVariantButton && goTo && (
          <BoxReveal boxColor='rgba(139,92,246,0.2)' duration={0.3}>
            <section className='mt-5 text-center'>
              <button
                type='button'
                className='text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto outline-none cursor-pointer'
                onClick={goTo}
              >
                <Sparkles size={11} />
                {textVariantButton}
              </button>
            </section>
          </BoxReveal>
        )}
      </form>
    </section>
  );
});

const BottomGradient = () => {
  return (
    <>
      <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent' />
      <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent' />
    </>
  );
};

// ==================== Label Component ====================

const Label = memo(function Label({ className, ...props }) {
  return (
    <label
      className={cn(
        'text-[10px] text-gray-500 font-mono uppercase tracking-widest',
        className
      )}
      {...props}
    />
  );
});

// ==================== Main Auth Component ====================

export default function Auth({ isRegisterMode = false }) {
  const navigate = useNavigate();
  const { login, register, updateProfile, authLoading, authError } = useStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [targetCompany, setTargetCompany] = useState('Google');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    setErrorMessage('');
    
    // Extract input values from form state or targets
    const form = event.target;
    const emailValue = form['Email Address']?.value || email;
    const passwordValue = form['Password']?.value || password;
    const usernameValue = form['Username']?.value || username;
    const targetRoleValue = form['Target Role']?.value || targetRole;
    const targetCompanyValue = form['Target Company']?.value || targetCompany;

    try {
      if (isRegisterMode) {
        if (!usernameValue || !emailValue || !passwordValue) {
          setErrorMessage('Please fill in all registration fields.');
          return;
        }
        await register(usernameValue, emailValue, passwordValue);
        await updateProfile({ targetRole: targetRoleValue, targetCompany: targetCompanyValue });
      } else {
        if (!emailValue || !passwordValue) {
          setErrorMessage('Please provide both email and password.');
          return;
        }
        await login(emailValue, passwordValue);
      }
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Authentication request failed.');
    }
  };

  const toggleMode = () => {
    setErrorMessage('');
    if (isRegisterMode) {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  const iconsArray = [
    {
      radius: 50,
      duration: 15,
      delay: 5,
      path: true,
      component: () => <Code className="text-violet-400 w-4.5 h-4.5" />
    },
    {
      radius: 95,
      duration: 20,
      delay: 10,
      path: true,
      reverse: true,
      component: () => <Terminal className="text-cyan-400 w-4.5 h-4.5" />
    },
    {
      radius: 140,
      duration: 25,
      delay: 15,
      path: true,
      component: () => <Shield className="text-emerald-400 w-4.5 h-4.5" />
    },
    {
      radius: 185,
      duration: 30,
      delay: 20,
      path: true,
      reverse: true,
      component: () => <Users className="text-amber-400 w-4.5 h-4.5" />
    }
  ];

  const fields = isRegisterMode ? [
    {
      label: 'Username',
      required: true,
      type: 'text',
      placeholder: 'e.g. NeoCoder',
      onChange: (e) => setUsername(e.target.value)
    },
    {
      label: 'Email Address',
      required: true,
      type: 'email',
      placeholder: 'operator@studyquest.io',
      onChange: (e) => setEmail(e.target.value)
    },
    {
      label: 'Password',
      required: true,
      type: 'password',
      placeholder: '••••••••••••',
      onChange: (e) => setPassword(e.target.value)
    },
    {
      label: 'Target Role',
      required: false,
      type: 'text',
      placeholder: 'e.g. Frontend Developer',
      onChange: (e) => setTargetRole(e.target.value)
    },
    {
      label: 'Target Company',
      required: false,
      type: 'text',
      placeholder: 'e.g. Google',
      onChange: (e) => setTargetCompany(e.target.value)
    }
  ] : [
    {
      label: 'Email Address',
      required: true,
      type: 'email',
      placeholder: 'operator@studyquest.io',
      onChange: (e) => setEmail(e.target.value)
    },
    {
      label: 'Password',
      required: true,
      type: 'password',
      placeholder: '••••••••••••',
      onChange: (e) => setPassword(e.target.value)
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080a] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Cyber Grid Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full filter blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full filter blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Orbiting Tech Display with Ripple */}
        <div className="hidden lg:flex relative h-[450px] w-full items-center justify-center overflow-hidden">
          <Ripple />
          <TechOrbitDisplay iconsArray={iconsArray} text="StudyQuest OS" />
        </div>

        {/* Right Side: Animated Glassmorphic Form */}
        <div className="glassmorphism rounded-3xl p-8 relative z-10 box-glow-violet border-white/10 backdrop-blur-md bg-zinc-950/40 max-w-md mx-auto w-full">
          <AnimatedForm
            header={isRegisterMode ? 'CREATE STUDYQUEST PROFILE' : 'ACCESS STUDYQUEST OS'}
            subHeader={isRegisterMode ? 'INITIALIZE SYSTEM MODULES' : 'VERIFY IDENTITY CREDENTIALS'}
            fields={fields}
            submitButton={isRegisterMode ? 'Seed Profile' : 'Initialize Interface'}
            textVariantButton={isRegisterMode ? 'Switch to Connection Access' : 'Switch to Registration Module'}
            errorField={errorMessage || authError}
            onSubmit={handleSubmit}
            goTo={toggleMode}
            googleLogin="Access via Google Secure"
          />
        </div>

      </div>
    </div>
  );
}
