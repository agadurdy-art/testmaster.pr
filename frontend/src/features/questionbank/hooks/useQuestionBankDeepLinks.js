import { useEffect } from 'react';

// Deep-link handling for /question-bank. Extracted verbatim from
// pages/QuestionBank.js — the four effects below run in the same order they
// were declared in the original component (between the initial loadData
// effect and the band-change topics reload).
export default function useQuestionBankDeepLinks({
  searchParams,
  setSearchParams,
  navigate,
  setActiveTab,
  setTestCategory,
  setShowWritingModal,
  setShowReadingModal,
  setShowListeningModal,
  setShowSpeakingModal,
  modalDeepLink,
  setSelectedCambridgeTest,
  setShowCambridgeTestModal,
}) {
  // Deep-link support: `/question-bank?tab=practice` (from the Dashboard) opens
  // the Practice tab. Legacy `?tab=tests` and `?tab=progress` get redirected to
  // their standalone pages so those URLs keep working after the 4→2 consolidation.
  useEffect(() => {
    const requested = searchParams.get('tab');
    if (!requested) return;
    if (requested === 'tests') {
      navigate('/full-test', { replace: true });
      return;
    }
    if (requested === 'progress') {
      navigate('/progress', { replace: true });
      return;
    }
    if (requested === 'browse' || requested === 'overview') {
      setActiveTab('overview');
    } else if (requested === 'practice') {
      setActiveTab('practice');
    }
    // clean up the URL so refreshes don't re-trigger the redirect
    searchParams.delete('tab');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Open Full Tests tab when dashboard sends ?fulltests=cambridge|ai|picker.
  // 'cambridge' / 'ai' jump straight into the sub-list; anything else lands
  // the user on the "Choose Your Test Type" picker screen.
  useEffect(() => {
    const ft = searchParams.get('fulltests');
    if (!ft) return;
    setActiveTab('tests');
    if (ft === 'cambridge' || ft === 'ai') {
      setTestCategory(ft);
    } else {
      setTestCategory(null);
    }
    searchParams.delete('fulltests');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open a skill picker modal when dashboard sends a deep-link param
  // (?writing=1 / ?reading=1 / ?listening=1 / ?speaking=1). Sets
  // `modalDeepLink` so the modal close handler pops history instead of
  // stranding the user on /question-bank.
  useEffect(() => {
    const skill = ['writing', 'reading', 'listening', 'speaking'].find(
      (s) => searchParams.get(s) === '1'
    );
    if (!skill) return;
    if (skill === 'writing') setShowWritingModal(true);
    else if (skill === 'reading') setShowReadingModal(true);
    else if (skill === 'listening') setShowListeningModal(true);
    else if (skill === 'speaking') setShowSpeakingModal(true);
    modalDeepLink.current = true;
    searchParams.delete(skill);
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open Cambridge test modal when returning from a test via openTest param
  useEffect(() => {
    const openTest = searchParams.get('openTest');
    if (openTest) {
      const [book, test] = openTest.split('_');
      if (book && test) {
        const bookNum = book.replace('ielts', '');
        const testNum = test.replace('test', '');
        setSelectedCambridgeTest({ book, test, title: `IELTS ${bookNum} - Test ${testNum}` });
        setShowCambridgeTestModal(true);
        searchParams.delete('openTest');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps
}
