import { MathSubdomains, EnglishSubdomains } from "./SatSubdomains";
import { endpoints } from "../config";

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
    subdomain: subdomain.length > 0 ? subdomain : [""],
    difficulty: difficulty.length > 0 ? difficulty : [""],
  };
}

// Fetch questions from the server
export async function fetchQuestions(searchPayload) {
  try {
    const response = await fetch("/sat/find-questions-v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
    console.error("Error fetching questions:", error);
    throw error;
  }
}

// Prepare subdomains for rendering
export function prepareSubdomains(selectedSubdomains, handleSubdomainChange) {
  return Object.fromEntries(
    [
      ["Math", MathSubdomains],
      ["English", EnglishSubdomains],
    ].map(([name, subdomainConfig]) => [
      name,
      Object.entries(subdomainConfig).map(([category, subdomains]) => ({
        category,
        subdomains: subdomains.map((subdomain) => ({
          ...subdomain,
          checked: selectedSubdomains[subdomain.value] || false,
          onChange: () => handleSubdomainChange(subdomain.value),
        })),
      })),
    ]),
  );
}

export function decodeText(text) {
  if (!text) return "";

  // Handle HTML content differently
  const containsHTML = /<[a-z][\s\S]*>/i.test(text);

  if (containsHTML) {
    // For HTML content, we need to be careful with replacements
    // Replace only text content while preserving tags
    const replacements = [
      [/\bcomma\b/g, ","],
      [/\bnegative\b/g, "-"],
      [/\bminus\b/g, "-"],
      [/\bdivided by\b/g, "/"],
      [/\btimes\b/g, "×"],
    ];

    // Create a DOM parser to work with the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");

    // Function to recursively process text nodes
    function processTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        let content = node.textContent;
        replacements.forEach(([pattern, replacement]) => {
          content = content.replace(pattern, replacement);
        });
        node.textContent = content;
      } else {
        Array.from(node.childNodes).forEach(processTextNodes);
      }
    }

    processTextNodes(doc.body);
    return doc.body.innerHTML;
  } else {
    // Simple text replacement for non-HTML content
    let decodedText = text;
    decodedText = decodedText.replace(/\bcomma\b/gi, ",");
    decodedText = decodedText.replace(/\bnegative\b/gi, "-");
    decodedText = decodedText.replace(/\bminus\b/gi, "-");
    decodedText = decodedText.replace(/\bdivided by\b/gi, "/");
    decodedText = decodedText.replace(/\btimes\b/gi, "×");
    decodedText = decodedText.replace(
      /\*\{stroke-linecap:butt;stroke-linejoin:round;\}/g,
      "",
    );
    return decodedText;
  }
}

// Render question display logic
// In SatPageFunctions.js - Updated renderQuestionDisplay function
export function renderQuestionDisplay(
  isLoading,
  error,
  currentQuestions,
  currentQuestionIndex,
  handleNavigatePrevious,
  handleNavigateNext,
) {
  if (isLoading) {
    return { type: "loading", content: "Loading questions..." };
  }

  if (error) {
    return { type: "error", content: error };
  }

  if (currentQuestions.length > 0) {
    const currentQuestion = currentQuestions[currentQuestionIndex];

    // Process the content without transforming HTML
    let questionText = currentQuestion.question || "";
    let additionalDetails = currentQuestion.details || "";

    // Check if content contains SVG or graph elements
    const hasGraphContent =
      currentQuestion.hasGraph ||
      /svg|graph|plot|chart|figure|<\/?(svg|path|g|rect|circle)/i.test(
        questionText + additionalDetails,
      );

    // Only run text replacements (like "comma" to ",") but preserve HTML structure
    if (!hasGraphContent) {
      questionText = decodeText(questionText);
      additionalDetails = decodeText(additionalDetails);
    } else {
      if (questionText.includes("comma") || questionText.includes("negative")) {
        questionText = decodeText(questionText);
      }

      if (
        additionalDetails &&
        (additionalDetails.includes("comma") ||
          additionalDetails.includes("negative"))
      ) {
        additionalDetails = decodeText(additionalDetails);
      }
    }

    return {
      type: "question",
      content: {
        questionDetails: {
          ...currentQuestion,
          question: questionText,
          details: additionalDetails,
          hasGraph: hasGraphContent,
          // Flag to indicate if content should be treated as HTML
          isHtml:
            /<[a-z][\s\S]*>/i.test(questionText) ||
            /<[a-z][\s\S]*>/i.test(additionalDetails),
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
  return { type: "empty", content: null };
}

export function renderAnswerChoices(
  answerChoices,
  selectedAnswer,
  onAnswerSelect,
) {
  // If no answer choices are available, return null
  if (!answerChoices) return null;

  // Split the answer choices (assuming they're comma-separated or newline-separated)
  const choices = answerChoices
    .split(/[,\n]/)
    .map((choice) => choice.trim())
    .filter(Boolean);

  // Generate answer choice elements with selection handling
  return choices.map((choice, index) => {
    const choiceLetter = String.fromCharCode(65 + index); // A, B, C, D, etc.

    return {
      letter: choiceLetter,
      text: choice,
      isSelected: selectedAnswer === choiceLetter,
      onSelect: () => onAnswerSelect(choiceLetter),
    };
  });
}
