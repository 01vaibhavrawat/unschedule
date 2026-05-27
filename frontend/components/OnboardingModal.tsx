import React, { useState } from 'react';
import { Sparkles, Target, Zap, ChevronRight, Check, Calendar } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Unschedule",
      subtitle: "A counter intuitive approach to time management",
      description: "Instead of scheduling work first, Unschedule flips the script. You schedule your breaks, meals, sleep, hobbies and breaks first. Work fits into the remaining slots. This prevents burnout and reduces procrastination by ensuring you have a real sense of how much time you have.",
      icon: <Sparkles className="w-16 h-16 text-[var(--color-primary)]" />,
      color: "bg-[var(--color-primary-light)] text-[var(--color-primary)]"
    },
    {
      title: "Focus on Your Goals",
      subtitle: "Make a schedule that prioritizes your goals",
      description: "The Goals section helps you define what truly matters. By keeping your top priorities visible at all times, you can align your daily tasks and schedule with your long-term vision. Add your goals and watch your progress unfold.",
      icon: <Target className="w-16 h-16 text-rose-500" />,
      color: "bg-rose-100 text-rose-500"
    },
    {
      title: "Atomic Habits",
      subtitle: "Small changes, remarkable results",
      description: "Mini Habits are behaviors so easy you can't fail—like doing one pushup or reading one page. Mini Habits emphasize that tiny, everyday improvements compound into massive changes. Build your streak and see your life transform, one small step at a time.",
      icon: <Zap className="w-16 h-16 text-amber-500" />,
      color: "bg-amber-100 text-amber-500"
    },
    {
      title: "Example Calendar",
      subtitle: "",
      description: "",
      // icon: <Calendar className="w-10 h-10 text-amber-500" />,
      color: "bg-amber-100 text-amber-500",
      image: "/unschedule_example_ss.png"
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] flex flex-col relative transform transition-all animate-in fade-in zoom-in duration-300">

        {/* Progress Bar */}
        <div className="flex h-2 w-full bg-gray-100">
          {steps.map((_, i) => (
            <div
              key={i}
              className={clsx(
                "flex-1 transition-colors duration-500",
                i <= step ? "bg-[var(--color-primary)]" : "bg-transparent"
              )}
            />
          ))}
        </div>

        <div className="p-12 flex flex-col items-center text-center space-y-8">
          {currentStep.icon && (
            <div className={clsx("p-6 rounded-full shadow-inner", currentStep.color)}>
              {currentStep.icon}
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">
              {currentStep.title}
            </h2>
            <h3 className="text-xl font-medium text-[var(--color-primary)]">
              {currentStep.subtitle}
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg mx-auto">
              {currentStep.description}
            </p>
          </div>

          {currentStep.image && (
            <div className="onboarding-image-container w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-gray-200 shadow-lg bg-gray-50">
              <Image
                src={currentStep.image}
                alt={currentStep.title}
                width={600}
                height={400}
                className="w-full h-auto object-contain max-h-[300px]"
                unoptimized
              />
            </div>
          )}

          <div className="w-full pt-8 flex items-center justify-between">
            <div className="flex space-x-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    i === step ? "w-8 bg-[var(--color-primary)]" : "bg-gray-500"
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-black px-8 py-3 rounded-full font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span>{isLastStep ? "Get Started" : "Next"}</span>
              {isLastStep ? <Check className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
