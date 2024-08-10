// Sample questions. DONT touch this data
const questions = [
    {
        text: "Which language is primarily used for web app development?",
        options: ["C#", "Python", "JavaScript", "Swift"],
        correct: 2
    },
    {
        text: "Which of the following is a relational database management system?",
        options: ["Oracle", "Scala", "Perl", "Java"],
        correct: 0
    },
    {
        text: "What does HTML stand for?",
        options: ["Hyperlink and Text Markup Language", "High Technology Modern Language", "Hyper Text Markup Language", "Home Tool Markup Language"],
        correct: 2
    },
    {
        text: "What does CSS stand for?",
        options: ["Cascading Stylesheets", "Cascading Styling Styles", "Cascading Sheets for Stylings", "Cascaded Stylesheets"],
        correct: 0
    },
    {
        text: "Which of the following is not an object-oriented programming language?",
        options: ["Java", "C#", "Scala", "C"],
        correct: 3
    },
    {
        text: "Which tool is used to ensure code quality in JavaScript?",
        options: ["JSLint", "TypeScript", "Babel", "Webpack"],
        correct: 0
    },
    {
        text: "What is the primary use of the Git command 'clone'?",
        options: ["To stage changes", "To copy a repository", "To switch to a different branch", "To list all the files in a repository"],
        correct: 1
    },
    {
        text: "What does API stand for in the context of programming?",
        options: ["Apple Pie Interface", "Application Programming Interface", "Advanced Peripheral Integration", "Application Process Integration"],
        correct: 1
    },
    {
        text: "Javascript is a single threaded programming language",
        options: ["True", "False"],
        correct: 0
    },
    {
        text: "API calls in Javascript can be done using the following method",
        options: ["setTimeout()", "setInterval()", "fetch()", "get()"],
        correct: 2
    },
];



let currentQuestionIndex = 0;
let score = 0;

const questionText = document.getElementById("question");
const optionsContainer = document.getElementById("answer-list");
const submitButton = document.getElementById("submit");
const nextButton = document.getElementById("next");

function loadQuestion() {
    const question = questions[currentQuestionIndex];
    questionText.textContent = question.text;
    optionsContainer.innerHTML = "";
    question.options.forEach((option, index) => {
        const optionElement = document.createElement("li");
        optionElement.textContent = option;
        optionElement.className = "option";
        optionElement.dataset.index = index;
        optionsContainer.appendChild(optionElement);
    });
    nextButton.style.display = "none";
    submitButton.style.display = "block";
}

function validateAnswer() {
    const selectedOption = optionsContainer.querySelector(".selected");
    if (!selectedOption) {
        alert("Please select an option!");
        return;
    }
    const selectedAnswerIndex = parseInt(selectedOption.dataset.index, 10);
    if (selectedAnswerIndex === questions[currentQuestionIndex].correct) {
        score++;
        alert("Correct!");
    } else {
        alert("Wrong!");
    }
    nextButton.style.display = "block";
    submitButton.style.display = "none";
}

function handleNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        alert(`Quiz completed! Your score: ${score}/${questions.length}`);
        // Reset the quiz
        currentQuestionIndex = 0;
        score = 0;
        loadQuestion();
    }
}

optionsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("option")) {
        optionsContainer.querySelectorAll(".option").forEach(option => {
            option.classList.remove("selected");
        });
        e.target.classList.add("selected");
    }
});

submitButton.addEventListener("click", validateAnswer);
nextButton.addEventListener("click", handleNextQuestion);

// Load the first question on startup
loadQuestion();