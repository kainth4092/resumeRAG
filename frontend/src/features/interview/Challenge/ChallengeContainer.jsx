import { useChallenge } from "./hooks/useChallenge";
import ChallengeLanding from "./components/ChallengeLanding";
import ChallengeModal from "./components/ChallengeModal";
import ChallengeReview from "./components/ChallengeReview";
import ChallengeResult from "./components/ChallengeResult";
import ChallengeTest from "./components/ChallengeTest";

export default function ChallengeContainer({ onBackToPrep }) {
  const challenge = useChallenge();

  return (
    <div className="space-y-6">
      <ChallengeLanding
        step={challenge.step}
        error={challenge.error}
        onStartClick={() => challenge.setShowModal(true)}
      />

      <ChallengeModal
        showModal={challenge.showModal}
        setShowModal={challenge.setShowModal}
        startChallengeSetup={challenge.startChallengeSetup}
        loading={challenge.loading}
      />

      <ChallengeTest
        step={challenge.step}
        questions={challenge.questions}
        currentIdx={challenge.currentIdx}
        setCurrentIdx={challenge.setCurrentIdx}
        userAnswers={challenge.userAnswers}
        selectOption={challenge.selectOption}
        timeLeft={challenge.timeLeft}
        isSubmitting={challenge.isSubmitting}
        submitTest={challenge.submitTest}
        getTimerColorClass={challenge.getTimerColorClass}
        formatTime={challenge.formatTime}
      />

      <ChallengeResult
        step={challenge.step}
        result={challenge.result}
        onBackToPrep={onBackToPrep}
        onReviewAnswers={() => {
          challenge.setCurrentIdx(0);
          challenge.setStep("review");
        }}
      />

      <ChallengeReview
        step={challenge.step}
        setStep={challenge.setStep}
        questions={challenge.questions}
        currentIdx={challenge.currentIdx}
        setCurrentIdx={challenge.setCurrentIdx}
        userAnswers={challenge.userAnswers}
        onBackToPrep={onBackToPrep}
      />
    </div>
  );
}
