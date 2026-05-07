import React from 'react';
import { Joyride, CallBackProps, STATUS, Step } from 'react-joyride';

interface InteractiveTourProps {
  run: boolean;
  onComplete: () => void;
}

export function InteractiveTour({ run, onComplete }: InteractiveTourProps) {
  const steps: Step[] = [
    {
      target: '#sidebar-goals',
      content: 'Here you can add and track your top priorities. Keep them visible to stay focused on what matters most.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '#sidebar-habits',
      content: 'This section displays your atomic and mini habits. Tick them off daily to build your streak!',
      placement: 'right',
    },
    {
      target: '#calendar-view',
      content: 'This is your Unschedule. Remember to schedule your play, meals, and rest FIRST. Work fits into the gaps.',
      placement: 'center',
    },
    {
      target: '#add-task-btn',
      content: 'Click here to add new tasks, events, or habits. You can also click and drag directly on the calendar!',
      placement: 'left',
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'var(--color-primary)',
          textColor: '#374151',
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          backgroundColor: 'var(--color-primary)',
          borderRadius: '9999px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#6b7280',
        },
        buttonSkip: {
          color: '#6b7280',
        }
      }}
    />
  );
}
