import React from 'react';
import { Joyride, STATUS, Step, EVENTS } from 'react-joyride';

interface InteractiveTourProps {
  run: boolean;
  onComplete: () => void;
  onStepChange?: (nextIndex: number) => void;
}

export function InteractiveTour({ run, onComplete, onStepChange }: InteractiveTourProps) {
  const steps: Step[] = [
    {
      target: '#sidebar-goals',
      content: 'Here you can add and track your top priorities. Keep them visible to stay focused on what matters most.',
      placement: 'right',
      disableBeacon: true,
    },
    {
      target: '#sidebar-habits',
      content: 'This section displays the atomic habits scheduled on the calendar. Tick them off daily to build your streak!',
      placement: 'right',
    },
    // {
    //   target: '#calendar-view',
    //   content: 'This is your Unschedule. Remember to schedule your breaks, meals, and rest FIRST. Work fits into the gaps.',
    //   placement: 'left',
    // },
    {
      target: '#add-task-btn',
      content: 'Click here to add new tasks, events, or habits. You can also click and drag directly on the calendar!',
      placement: 'left',
    },
    {
      target: "#sidebar-toggle-button",
      content: "Click here to collapse or expand the side bar.",
      placement: "left"

    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status, index, type, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === 'close') {
      onComplete();
    } else if (type === EVENTS.STEP_BEFORE) {
      if (onStepChange) {
        onStepChange(index);
      }
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
