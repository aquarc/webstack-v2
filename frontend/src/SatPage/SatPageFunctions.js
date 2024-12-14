import { MathSubdomains, EnglishSubdomains } from './SatSubdomains';
import { endpoints } from '../config';

// Consolidated search payload generation
export function getSearchPayload(state) {
  const {
    selectedTest,
    selectedTestSection,
    selectedSubdomains,
    selectedDifficulties,
  } = state;

  const difficulty = Object.entries(selectedDifficulties)
    .filter(([_, isSelected]) => isSelected)
    .map(([difficulty]) => difficulty);

  const subdomain = Object.entries(selectedSubdomains)
    .filter(([_, isSelected]) => isSelected)
    .map(([subdomain]) => subdomain);

  return {
    test: selectedTest,
    subdomain: subdomain.length > 0 ? subdomain : [''],
    difficulty: difficulty.length > 0 ? difficulty : [''],
  };
}

// Fetch questions from the server
export async function fetchQuestions(searchPayload) {
  try {
    const response = await fetch('/sat/find-questions-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || `HTTP error ${response.status}`;
      } catch (parseError) {
        errorMessage = `HTTP error ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

// Prepare subdomains for rendering
export function prepareSubdomains(
  selectedTestSection,
  selectedSubdomains,
  handleSubdomainChange
) {
  const subdomainConfig =
    selectedTestSection === 'Math' ? MathSubdomains : EnglishSubdomains;

  return Object.entries(subdomainConfig).map(([category, subdomains]) => ({
    category,
    subdomains: subdomains.map((subdomain) => ({
      ...subdomain,
      checked: selectedSubdomains[subdomain.value] || false,
      onChange: () => handleSubdomainChange(subdomain.value),
    })),
  }));
}

// Render question display logic
function decodeText(text) {
  // Create a temporary element to handle the HTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = text;

  // Get the decoded text from the temporary element
  const decodedText = tempElement.textContent || tempElement.innerText || '';

  return decodedText;
}

// Render question display logic
export function renderQuestionDisplay(
  isLoading,
  error,
  currentQuestions,
  currentQuestionIndex,
  handleNavigatePrevious,
  handleNavigateNext
) {
  if (isLoading) {
    return { type: 'loading', content: 'Loading questions...' };
  }

  if (error) {
    return { type: 'error', content: error };
  }

  if (currentQuestions.length > 0) {
    const currentQuestion = currentQuestions[currentQuestionIndex];

    // Decode the question text
    const questionText = decodeText(currentQuestion.question);

    // Decode the additional details (if available)
    const additionalDetails = currentQuestion.details ? decodeText(currentQuestion.details) : null;

    // Decode the answer choices (if available)
    const answerChoices = currentQuestion.answer_choices
      ? decodeText(currentQuestion.answer_choices)
      : null;

    return {
      type: 'question',
      content: {
        questionDetails: {
          ...currentQuestion,
          question: questionText,
          details: additionalDetails,
          answer_choices: answerChoices,
        },
        navigation: {
          hasPrevious: currentQuestionIndex > 0,
          hasNext: currentQuestionIndex < currentQuestions.length - 1,
          currentIndex: currentQuestionIndex + 1,
          totalQuestions: currentQuestions.length,
        },
      },
    };
  }
  return { type: 'empty', content: null };
}

export function renderAnswerChoices(
  answerChoices, 
  selectedAnswer, 
  onAnswerSelect
) {
  // If no answer choices are available, return null
  if (!answerChoices) return null;

  // Split the answer choices (assuming they're comma-separated or newline-separated)
  const choices = answerChoices.split(/[,\n]/).map(choice => choice.trim()).filter(Boolean);

  // Generate answer choice elements with selection handling
  return choices.map((choice, index) => {
    const choiceLetter = String.fromCharCode(65 + index); // A, B, C, D, etc.
    
    return {
      letter: choiceLetter,
      text: choice,
      isSelected: selectedAnswer === choiceLetter,
      onSelect: () => onAnswerSelect(choiceLetter)
    };
  });
}