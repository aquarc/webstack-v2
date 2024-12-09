import { MathSubdomains, EnglishSubdomains } from './SatSubdomains';
import { endpoints } from '../config';

export function getSearchPayload(state) {
  const {
    selectedTest,
    selectedTestSection,
    selectedSubdomains,
    selectedDifficulties,
  } = state;

  return {
    test: selectedTest,
    difficulty: Object.entries(selectedDifficulties)
      .filter(([_, isSelected]) => isSelected)
      .map(([difficulty]) => difficulty),
    subdomain: Object.entries(selectedSubdomains)
      .filter(([_, isSelected]) => isSelected)
      .map(([subdomain]) => subdomain),
  };
}

export async function fetchQuestions(searchPayload) {
  try {
    const response = await fetch(endpoints.findQuestionsV2, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

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
    return {
      type: 'question',
      content: {
        text: currentQuestion.text,
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

// Helper function to check if MathJax is available
const isMathJaxAvailable = () => {
  return typeof window !== 'undefined' && window.MathJax !== undefined;
};

export class QuestionManager {
  constructor() {
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
  }

  displayQuestionDetails(question) {
    const questionText = document.getElementById('questionText');
    const questionDetails = document.getElementById('questionDetails');

    if (question.details) {
      const detailsDiv = document.createElement('div');
      detailsDiv.className = 'question-details';
      detailsDiv.innerHTML = this.decodeText(question.details);

      const existingDetails = document.querySelector('.question-details');
      if (existingDetails) {
        existingDetails.remove();
      }

      if (questionText?.parentNode) {
        questionText.parentNode.insertBefore(detailsDiv, questionText);
      }

      if (isMathJaxAvailable()) {
        window.MathJax.typesetPromise([detailsDiv]).catch((err) =>
          console.error('MathJax error:', err)
        );
      }
    }

    if (questionDetails) {
      questionDetails.innerHTML = this.generateMetadataHTML(question);
    }

    if (questionText && question.question) {
      questionText.innerHTML = this.decodeText(question.question);
      if (isMathJaxAvailable()) {
        window.MathJax.typesetPromise([questionText]).catch((err) =>
          console.error('MathJax error:', err)
        );
      }
    }
  }

  displayQuestion(question, checkAnswerCallback) {
    const answerContainer = document.querySelector('.answer_container');
    if (!answerContainer) return;

    answerContainer.innerHTML = '';

    const questionNumber = document.getElementById('questionNumber');
    if (questionNumber) {
      questionNumber.textContent = `Question ${
        this.currentQuestionIndex + 1
      } of ${this.currentQuestions.length}`;
    }

    let choices = this.parseAnswerChoices(question.answerChoices);

    if (choices.length > 0) {
      choices.forEach((choice, index) => {
        const letter = choice.letter || String.fromCharCode(65 + index);
        const content = this.decodeText(choice.content || choice.body || '');

        const button = this.createAnswerButton(letter, content);
        button.addEventListener('click', () =>
          checkAnswerCallback(letter, question.answer, question)
        );

        answerContainer.appendChild(button);
      });
    } else {
      const inputContainer = this.createFreeResponseInput(
        question,
        checkAnswerCallback
      );
      answerContainer.appendChild(inputContainer);
    }

    this.updateNavigationButtons();

    if (isMathJaxAvailable()) {
      window.MathJax.typesetPromise([answerContainer]).catch((err) =>
        console.error('MathJax error:', err)
      );
    }
  }

  // Helper methods
  decodeText(text) {
    if (!text) return '';
    return text
      .replace(/\\u003c/g, '<')
      .replace(/\\u003e/g, '>')
      .replace(/\\u0026rsquo;/g, "'")
      .replace(/\\u0026/g, '&')
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n');
  }

  generateMetadataHTML(question) {
    return `
          <div class="metadata-item">
            <span class="metadata-label">Difficulty:</span>
            <span class="metadata-value">${question.difficulty || 'N/A'}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Category:</span>
            <span class="metadata-value">${question.category || 'N/A'}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Skill:</span>
            <span class="metadata-value">${question.skill || 'N/A'}</span>
          </div>
        `;
  }

  parseAnswerChoices(choices) {
    try {
      if (Array.isArray(choices)) return choices;
      if (typeof choices === 'string') {
        const parsed = JSON.parse(choices);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          return Object.entries(parsed).map(([key, value]) => ({
            content: value.body || value.content || value,
            letter: key.toUpperCase(),
          }));
        }
        return parsed;
      }
      if (typeof choices === 'object' && choices !== null) {
        return ['a', 'b', 'c', 'd']
          .map((letter) => {
            const choice = choices[letter];
            return choice?.body
              ? {
                  letter: letter.toUpperCase(),
                  content: choice.body,
                }
              : null;
          })
          .filter(Boolean);
      }
      return [];
    } catch (e) {
      console.error('Error parsing answer choices:', e);
      return [];
    }
  }

  createAnswerButton(letter, content) {
    const button = document.createElement('button');
    button.className = 'answer_button';

    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer-option';

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'answer-content';
    contentWrapper.innerHTML = `${letter}. ${content}`;

    answerDiv.appendChild(contentWrapper);
    button.appendChild(answerDiv);

    return button;
  }

  createFreeResponseInput(question, checkAnswerCallback) {
    const container = document.createElement('div');
    container.className = 'answer-input-container';

    const form = document.createElement('form');
    form.onsubmit = (e) => {
      e.preventDefault();
      const input = form.querySelector('#user-answer-input');
      if (input) {
        const userAnswer = input.value.trim();
        checkAnswerCallback(userAnswer, question.answer, question);
      }
    };

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'user-answer-input';
    input.className = 'answer-input';
    input.placeholder = 'Type your answer here...';
    input.required = true;

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Submit Answer';
    submit.className = 'submit-answer-button';

    form.appendChild(input);
    form.appendChild(submit);
    container.appendChild(form);

    return container;
  }

  updateNavigationButtons() {
    const prevButton = document.getElementById('prevQuestionBtn');
    const nextButton = document.getElementById('nextQuestionBtn');

    if (prevButton) {
      prevButton.disabled = this.currentQuestionIndex === 0;
    }
    if (nextButton) {
      nextButton.disabled =
        this.currentQuestionIndex === this.currentQuestions.length - 1;
    }
  }
}