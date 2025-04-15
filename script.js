const API_KEY = 'sk-your-api-key'; // replace with your OpenAI key
let currentStep = 0;
let lessonData = [];

document.getElementById('generateBtn').addEventListener('click', generateLesson);
document.getElementById('nextButton').addEventListener('click', nextSection);

async function generateLesson() {
  const topic = document.getElementById('topicInput').value.trim();
  const difficulty = document.getElementById('difficulty').value;
  if (!topic || !difficulty) {
    alert('Please enter topic and select difficulty.');
    return;
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: `Create a 5-minute micro lesson about "${topic}" for ${difficulty} learners.
Format: ### Section Title | Section Content | **Key Points:** Bullet1; Bullet2; Bullet3`
        }]
      })
    });
    const data = await res.json();
    lessonData = parseLesson(data.choices[0].message.content);
    showLesson();
    renderStep(0);
    updateProgress();
  } catch (e) {
    alert('Error generating lesson.');
    console.error(e);
  }
}

function parseLesson(text) {
  return text.split('###').slice(1).map(sec => {
    const [title, content, keys] = sec.split('|').map(s=>s.trim());
    return {
      title,
      content,
      keyPoints: keys.replace('**Key Points:**','').split(';').map(k=>k.trim())
    };
  });
}

function showLesson() {
  document.querySelector('.input-section').style.display = 'none';
  document.getElementById('lessonContainer').style.display = 'block';
}

function renderStep(i) {
  const s = lessonData[i];
  document.getElementById('lessonContent').innerHTML = `
    <div class="step-card">
      <h3>${s.title}</h3>
      <p>${s.content}</p>
      <div class="key-points">
        <h4>Key Points:</h4>
        <ul>${s.keyPoints.map(k=>`<li>${k}</li>`).join('')}</ul>
      </div>
    </div>`;
  document.getElementById('nextButton').style.display = (i < lessonData.length-1) ? 'block' : 'none';
}

function nextSection() {
  currentStep++;
  if (currentStep < lessonData.length) {
    renderStep(currentStep);
    updateProgress();
  } else {
    alert('Lesson completed!');
    location.reload();
  }
}

function updateProgress() {
  const pct = ((currentStep+1)/lessonData.length)*100;
  document.getElementById('lessonProgress').style.width = pct + '%';
}
