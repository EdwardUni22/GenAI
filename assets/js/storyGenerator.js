let chatHistory = [];

async function generateStory() {
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: chatHistory,
                model: 'llama-3.3-70b-versatile',
                max_tokens: 32768,
                response_format: {
                    "type": "json_object"
                }
            })
        });
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        console.log('Response:', content);

        chatHistory.push({
            role: 'assistant',
            content: content
        });

        try {
            return JSON.parse(content);
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            throw new Error('Failed to parse story response as JSON');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

document.getElementById('storyForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const existingStory = document.getElementById('story');
    if (existingStory) {
        existingStory.remove();
    }

    const existingAdjustmentForm = document.getElementById('adjustform');
    if (existingAdjustmentForm) {
        existingAdjustmentForm.remove();
    }

    const existingAdjustment = document.getElementById('adjustment');
    if (existingAdjustment) {
        existingAdjustment.remove();
    }
    
    const title = document.getElementById('title').value;
    const ageTarget = document.getElementById('age-target').value;
    const tags = document.getElementById('tags').value;
    const customPrompt = document.getElementById('prompt').value;

    console.log('Title:', title);
    console.log('Target Age Group:', ageTarget);
    console.log('Tags:', tags);
    console.log('Additional Elements:', customPrompt);
    
    const prompt = `
        You are a professional storyteller specialized in creating engaging narratives. If any of the following parameters are empty, generate appropriate values based on these rules. If any parameters contain spelling mistakes or grammatical errors, correct them in your response while maintaining the intended meaning.

        PARAMETER GENERATION RULES:
        - If Title is empty: Generate an engaging, age-appropriate title that connects with the other provided parameters
        - If Target Age Group is empty: Generate an appropriate age range based on the story elements and complexity (options: 3-5, 6-8, 8-12, 12-15, 15+)
        - If Tags are empty: Generate 3-5 relevant tags that would create an interesting story
        - If Additional Elements are empty: Generate a creative story prompt that includes character details, plot elements, and a theme or message

        STORY PARAMETERS:
        Title: ${title}
        Target Age Group: ${ageTarget}
        Tags: ${tags}
        Additional Elements: ${customPrompt}

        REQUIREMENTS:
        1. Create a story that strictly adheres to:
        - The specified or generated title
        - Age-appropriate content and language for {age_range}
        - Themes and elements from the provided or generated tags
        - Elements from the custom prompt or generated story elements

        2. Story Structure:
        - Divide the story into 3-5 substantial parts
        - Each part should be a complete scene or chapter (multiple paragraphs)
        - Part 1: Opening chapter (setup, character introduction, world-building)
        - Part 2-3: Development chapters (rising action, conflicts, character growth)
        - Final Part: Concluding chapter (climax and resolution)
        - Each part should be approximately 250-400 words
        - Ensure smooth transitions between parts

        3. Content Guidelines:
        - Maintain consistent tone throughout
        - Include engaging dialogue when appropriate
        - Use descriptive language suitable for age group
        - Ensure all content is appropriate for target age
        - Incorporate specified tags naturally into the narrative
        - Create rich, detailed scenes rather than brief summaries
        - Balance narrative, dialogue, and description in each part

        Your response must be formatted as a valid JSON response according to the following structure, do not include any comments about what you've generated in your response:

        {
            "title": "The Story Title",
            "story": {
                "1": "First substantial part of the story (opening chapter)...",
                "2": "Second substantial part of the story (development)...",
                "3": "Third substantial part of the story (conclusion)...",
                ...
            }
        }

        Remember to create an engaging, cohesive narrative that naturally incorporates all specified elements while maintaining appropriate content and language for the target age group. Each part should feel complete and substantial, like a proper chapter or scene in a book.`;
    
    chatHistory = [
        {
            role: 'user',
            content: prompt
        }
    ];

    try {
        const story = await generateStory();
        displayStory(story, 'story');
        insertAdjustmentForm(story);
    } catch (error) {
        throw error;
    }
});

function displayStory(story, id) {
    const storySection = document.createElement('section');
    storySection.id = id;
    storySection.className = 'main style2 special';
    
    // Create the story content HTML
    let storyContentHTML = '';
    for (let i = 1; i <= Object.keys(story.story).length; i++) {
        storyContentHTML += `<p class="story-part">${story.story[i]}</p>`;
    }

    storySection.innerHTML = `
        <div class="container">
            <h2>${story.title}</h2>
            <div class="story-content">
                ${storyContentHTML}
            </div>
        </div>
    `;
    
    document.body.insertBefore(storySection, document.getElementById('footer'));
    storySection.scrollIntoView({ behavior: 'smooth' });
}

async function adjustStory() {
    const existingAdjustment = document.getElementById('adjustment');
    if (existingAdjustment) {
        existingAdjustment.remove();
    }

    const adjustmentType = document.getElementById('adjustmentType').value;
    let storyPart = '';
    if (adjustmentType === 'specific') {
        storyPart = document.getElementById('storyPart').value;
    }
    const adjustmentDetails = document.getElementById('adjustmentDetails').value;

    console.log('Adjustment Type:', adjustmentType);
    if (adjustmentType === 'specific') {
        console.log('Story Part:', storyPart);
    }
    console.log('Adjustment Details:', adjustmentDetails);

    const adjustment = `
        You are a professional storyteller making adjustments to a previously generated story. Review the changes requested and modify the story while maintaining its original structure and quality.

        ADJUSTMENT PARAMETERS:
        Type of Adjustment: ${adjustmentType}
        ${adjustmentType === 'specific' ? `Part to Adjust: Part ${storyPart}` : 'Adjust entire story'}
        Requested Changes: ${adjustmentDetails}

        REQUIREMENTS:
        1. Maintain:
        - Original story's age-appropriate content and language
        - Core narrative elements and character consistency
        - JSON structure and formatting
        - Part lengths (250-400 words per part)
        - Natural flow between parts

        2. Adjustment Guidelines:
        - Apply changes seamlessly within the story
        - Keep unaffected parts consistent with the original
        - Ensure adjustments align with the story's overall tone
        - Preserve the story's coherent structure
        - If adjusting a specific part, maintain smooth transitions with adjacent parts
        - If any part exceeds 400 words after adjustments, split it into multiple parts while maintaining narrative flow
        - When splitting parts, renumber subsequent parts accordingly

        Your response must maintain the same JSON format:
        {
            "title": "The Story Title",
            "story": {
                "1": "First substantial part...",
                "2": "Second substantial part...",
                "3": "Third substantial part...",
                ...
            }
        }

        Make only the requested adjustments while preserving the story's overall quality and integrity.`;

    chatHistory.push({
        role: 'user',
        content: adjustment
    });

    try {
        const story = await generateStory();
        displayStory(story, 'adjustment');

        const storyPartSelect = document.getElementById('storyPart');
    
        if (storyPartSelect) {
            // Clear existing options
            storyPartSelect.innerHTML = Object.keys(story.story).map(num => 
                `<option value="${num}">Part ${num}</option>`
            ).join('')
        }
    } catch (error) {
        throw error;
    }
}

function insertAdjustmentForm(story) {
    const existingForm = document.getElementById('adjustform');
    if (existingForm) {
        existingForm.remove();
    }

    const form = document.createElement('section');
    form.id = 'adjustform';
    form.className = 'main style1';

    form.innerHTML = `
        <div class="container">
            <h2 class="align-center"><strong>Adjust</strong> Your Story</h2>
            <form id="adjustmentForm" class="form-style">
				<div class="row gtr-uniform">
                    <div class="col-6 col-12-xsmall col-12">
                        <label for="adjustmentType">What would you like to adjust?</label>
                        <select id="adjustmentType" name="adjustmentType" required>
                            <option value="">Select an option</option>
                            <option value="tone">Change the tone</option>
                            <option value="length">Make it longer/shorter</option>
                            <option value="complexity">Adjust complexity</option>
                            <option value="characters">Modify characters</option>
                            <option value="ending">Change the ending</option>
                            <option value="specific">Specific part adjustment</option>
                        </select>
                    </div>
                
                
                    <div class="col-6 col-12-xsmall" id="partSelector" style="display: none;">
                        <label for="storyPart">Which part would you like to adjust?</label>
                        <select id="storyPart" name="storyPart">
                            ${Object.keys(story.story).map(num => 
                                `<option value="${num}">Part ${num}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="col-12">
                        <label for="adjustmentDetails">Describe your requested changes:</label>
                        <textarea 
                            id="adjustmentDetails" 
                            name="adjustmentDetails" 
                            rows="4" 
                            placeholder="Be specific about what you'd like to change..."
                            required
                        ></textarea>
                    </div>

                    <div class="col-12">
                        <ul class="actions special">
                            <li><input type="submit" value="Adjust Story" class="button" /></li>
                        </ul>
                    </div>
                </div>
            </form>
        </div>
    `;

    const adjustmentType = form.querySelector('#adjustmentType');
    adjustmentType.addEventListener('change', (e) => {
        if (e.target.value === 'specific') {
            partSelector.style.display = 'block';
            document.getElementById('adjustmentType').parentElement.classList.remove('col-12');
        } else {
            partSelector.style.display = 'none';
            document.getElementById('adjustmentType').parentElement.classList.add('col-12');
        }
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        adjustStory();
    });

    document.body.insertBefore(form, document.getElementById('footer'));
}