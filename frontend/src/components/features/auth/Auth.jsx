import React, { memo, useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../hooks/useStore';
import { motion, useAnimation, useInView, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Eye, EyeOff, Shield, Sparkles, Code, Terminal, Users, Hash, AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

// ==================== Skill Icons ====================

const JavaScriptIcon = () => (
  <svg className="w-5.5 h-5.5 drop-shadow-[0_0_8px_rgba(247,223,30,0.4)]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#F7DF1E"/>
    <path fill="#000000" d="M1.5 0h21a1.5 1.5 0 0 1 1.5 1.5v21a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 0 22.5v-21A1.5 1.5 0 0 1 1.5 0zm19.285 19.31c-.025-1.075-.713-1.88-1.957-1.88-1.132 0-1.81.62-2.015 1.72-.04.267-.02.81.02 1.14.128.724.535 1.132 1.28 1.132.87 0 1.357-.426 1.528-1.236H21c-.213 1.45-1.15 2.24-2.643 2.24-1.79 0-2.707-1.13-2.707-2.96 0-1.94 1.108-3.09 2.856-3.09 1.833 0 2.622 1.13 2.622 2.94v.015c0 1.11-.02 1.98-.02 1.98h-1.15v-2zm-6.8-6.95v9.98h-1.136v-5.63c-.02-.81-.04-1.62-.04-2.43h-.02l-.853 1.32-2.388 3.65H8.07V12.36H9.2v5.63c.02.81.04 1.62.04 2.43h.02l.853-1.32 2.388-3.65h1.15z" transform="scale(0.8) translate(3, 3)"/>
  </svg>
);

const ReactIcon = () => (
  <svg className="w-7 h-7 animate-slow-rotate drop-shadow-[0_0_8px_rgba(97,218,251,0.5)]" viewBox="-11.5 -10.23 23 20.46" xmlns="http://www.w3.org/2000/svg">
    <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
    <g stroke="#61DAFB" strokeWidth="1.2" fill="none">
      <ellipse rx="11" ry="4.2"/>
      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    </g>
  </svg>
);

const NodejsIcon = () => (
  <svg className="w-6 h-6 drop-shadow-[0_0_8px_rgba(51,153,51,0.4)]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#339933" d="M12 24c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12zm-1.25-17.518c-.287 0-.528.21-.528.513v7.35l-2.073-1.19c-.29-.164-.67.042-.67.38v2.42c0 .2.103.385.277.485l4.24 2.45c.29.167.674-.04.674-.38v-7.316l2.07 1.19c.287.165.67-.04.67-.378v-2.42c0-.2-.102-.387-.277-.487l-4.245-2.452a.557.557 0 0 0-.15-.065z"/>
  </svg>
);

const MongoDBIcon = () => (
  <svg className="w-6 h-6 drop-shadow-[0_0_8px_rgba(71,162,72,0.4)]" viewBox="0 0 24 24" fill="#47A248" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0c-3.192 6.07-5.307 11.233-5.307 14.774 0 3.866 2.376 7.226 5.307 9.226 2.931-2 5.307-5.36 5.307-9.226C17.307 11.233 15.192 6.07 12 0zm-1.637 14.542c0-.529.161-.926.483-1.19.322-.264.832-.429 1.53-.497v-4.66c.264.444.471.956.621 1.536.15.58.225 1.194.225 1.843v2.778c-.7.069-1.21.234-1.532.497-.322.264-.482.66-.482 1.19 0 .529.16.925.482 1.189.322.264.831.429 1.53.498v1.141c-.266-.184-.509-.434-.73-.75-.221-.316-.388-.696-.5-.139a3.864 3.864 0 0 1-.161-1.129 3.01 3.01 0 0 1-.496-1.141z"/>
  </svg>
);

// ==================== Input Component ====================

const Input = memo(
  forwardRef(function Input(
    { className, type, ...props },
    ref
  ) {
    const radius = 100; // change this to increase the radius of the hover effect
    const [visible, setVisible] = useState(false);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({
      currentTarget,
      clientX,
      clientY,
    }) {
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
          #3b82f6,
          transparent 80%
        )
      `,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className='group/input rounded-lg p-[2px] transition duration-300'
      >
        <input
          type={type}
          className={cn(
            `shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
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
          background: boxColor ?? '#5046e6',
          borderRadius: 4,
        }}
      />
    </section>
  );
});

// ==================== Ripple Component ====================

const Ripple = memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.24,
  numCircles = 11,
  className = '',
}) {
  return (
    <section
      className={`max-w-[50%] absolute inset-0 flex items-center justify-center
        dark:bg-white/5 bg-neutral-50
        [mask-image:linear-gradient(to_bottom,black,transparent)]
        dark:[mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = mainCircleOpacity - i * 0.03;
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';
        const borderOpacity = 5 + i * 5;

        return (
          <span
            key={i}
            className='absolute animate-ripple rounded-full bg-foreground/15 border'
            style={{
              width: `${size}px`,
              height: `${size}px`,
              opacity: opacity,
              animationDelay: animationDelay,
              borderStyle: borderStyle,
              borderWidth: '1px',
              borderColor: `rgba(255, 255, 255, ${borderOpacity / 100})`,
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
            className='stroke-black/10 stroke-1 dark:stroke-white/10'
            cx='50%'
            cy='50%'
            r={radius}
            fill='none'
          />
        </svg>
      )}
      <section
        style={
          {
            '--duration': duration,
            '--radius': radius,
            '--delay': -delay,
          }
        }
        className={cn(
          'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10',
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
  text = 'CodeViz Academy',
}) {
  return (
    <section className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg'>
      <span className='pointer-events-none whitespace-pre-wrap bg-gradient-to-r from-violet-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-center text-6xl font-extrabold leading-none text-transparent tracking-wide text-glow-violet drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]'>
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
              className='g-button group/btn bg-white/[0.01] hover:bg-white/[0.04] border border-white/10 w-full rounded-xl h-11 font-mono text-xs font-semibold outline-hidden hover:cursor-pointer transition-colors relative'
              type='button'
              onClick={() => console.log('Google login clicked')}
            >
              <span className='flex items-center justify-center w-full h-full gap-3 text-gray-300'>
                {/* Premium Inline SVG Google Icon */}
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
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
            className='bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 relative block w-full text-white rounded-xl h-11 font-mono text-xs font-semibold shadow-md active:scale-[0.98] outline-hidden hover:cursor-pointer transition-all border border-violet-500/20'
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
                className='text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5 mx-auto outline-hidden cursor-pointer'
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

// ==================== AuthTabs Component ====================

const AuthTabs = memo(function AuthTabs({
  formFields,
  goTo,
  handleSubmit,
}) {
  return (
    <div className='flex max-lg:justify-center w-full md:w-auto'>
      {/* Right Side */}
      <div className='w-full lg:w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:px-[10%]'>
        <AnimatedForm
          {...formFields}
          fieldPerRow={1}
          onSubmit={handleSubmit}
          goTo={goTo}
          googleLogin='Login with Google'
        />
      </div>
    </div>
  );
});

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

export {
  Input,
  BoxReveal,
  Ripple,
  OrbitingCircles,
  TechOrbitDisplay,
  AnimatedForm,
  AuthTabs,
  Label,
  BottomGradient,
};

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
      component: () => <JavaScriptIcon />
    },
    {
      radius: 95,
      duration: 20,
      delay: 10,
      path: true,
      reverse: true,
      component: () => <ReactIcon />
    },
    {
      radius: 140,
      duration: 25,
      delay: 15,
      path: true,
      component: () => <NodejsIcon />
    },
    {
      radius: 185,
      duration: 30,
      delay: 20,
      path: true,
      reverse: true,
      component: () => <MongoDBIcon />
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
      placeholder: 'operator@codeviz.io',
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
      placeholder: 'operator@codeviz.io',
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
          <TechOrbitDisplay iconsArray={iconsArray} text="CodeViz Academy" />
        </div>

        {/* Right Side: Animated Glassmorphic Form */}
        <div className="glassmorphism rounded-3xl p-8 relative z-10 box-glow-violet border-white/10 backdrop-blur-md bg-zinc-950/40 max-w-md mx-auto w-full">
          <AnimatedForm
            header={isRegisterMode ? 'CREATE ACADEMY PROFILE' : 'ACCESS CODEVIZ ACADEMY'}
            subHeader={isRegisterMode ? 'INITIALIZE LEARNER PROFILE' : 'VERIFY LEARNER CREDENTIALS'}
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
