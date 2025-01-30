let chatHistory = [];

async function generateStory(adjustment=false) {
    try {
        let response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                    "type": adjustment ? "json_object" : "text"
                }
            })
        });
        
        let data = await response.json();
        let content = data.choices[0]?.message?.content;
        console.log('Response:', content);

        chatHistory.push({
            role: 'assistant',
            content: content
        });

        if (!adjustment) {
            chatHistory.push({
                role: 'user',
                content: `
                Using the provided story outline and thematic framework, create a complete, engaging narrative that brings the story to life. Maintain consistency with the established tone, style, and age-appropriate content while expanding each part into rich, detailed and complete scenes.
                For each part of the story:
                    1. Develop the brief description into a full, engaging chapter(~200 words)
                    2. Include natural dialogue and vivid descriptions
                    3. Ensure smooth transitions between parts
                    4. Maintain the established theme and emotional beats
                    5. Create an accompanying image prompt that captures a key moments from the scene, focusing on:
                        - Character roles instead of names
                        - Setting details and atmosphere
                        - Time of day and lighting
                        - Key landmarks or focal points
                Finally, generate a list of artistic style tags that will go at the end of each image prompt, these will ensure consistency across the style and design of the generated images
                Remember to maintain the established narrative voice and ensure all content, including image prompts, remains appropriate for the target age group. Each scene should feel complete and purposeful, contributing to the overall story arc while staying true to the original outline.
                Return your response in the following JSON format:
                {
                    "title": "The Story Title",
                    "story": {
                        "1": "Expanded narrative of part 1...",
                        "2": "Expanded narrative of part 2...",
                        [additional parts as needed]
                    },
                    "image_prompts": {
                        "1": "Detailed visual description for part 1...",
                        "2": "Detailed visual description for part 2...",
                        [additional prompts as needed]
                    },
                    "image_style_tags": "artistic style tags appropriate for age group and theme"
                }`
            });

            response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

            data = await response.json();
            content = data.choices[0]?.message?.content;
            console.log('Response:', content);

            chatHistory.push({
                role: 'assistant',
                content: content
            });
        }

        try {
            return JSON.parse(content);
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            throw new Error('Failed to parse story response as JSON');
        }
    } catch (error) {
        console.error('Error:', error);
        // alert('Failed to generate story. Please try again.');
        throw error;
    }
}

async function checkPrompt(prompt) {
    if (prompt === '') {
        return true;
    }
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer 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`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model: 'llama-guard-3-8b'
            })
        });

        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        console.log('Prompt check:', content);

        if (content.includes('unsafe')) {
            alert('The prompt contains unsafe content. Please adjust your prompt and try again.');
            return false
        }
    }
    catch (error) {
        console.error('Error:', error);
        alert('Failed to check the prompt. Please try again.');
        return false;
    }
    return true;
}

document.getElementById('storyForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (document.getElementById('storyButton').classList.contains('disabled')) {
        return;
    }
    document.getElementById('storyButton').classList.add('disabled');

    const existingStory = document.getElementById('story');
    if (existingStory) {
        existingStory.remove();
    }

    const existingAdjustmentForm = document.getElementById('adjustform');
    if (existingAdjustmentForm) {
        existingAdjustmentForm.remove();
    }

    document.getElementById('footeradjust').style.display = 'none';

    const existingAdjustment = document.getElementById('adjustment');
    if (existingAdjustment) {
        existingAdjustment.remove();
    }
    
    const ageTarget = document.getElementById('age-target').value;
    const storyLength = document.getElementById('story-length').value;
    const genre = document.getElementById('genre').value;
    const storyTheme = document.getElementById('story-theme').value;
    const setting = document.getElementById('setting').value;
    const protagonist = document.getElementById('protagonist').value;
    const customPrompt = document.getElementById('prompt').value;
    
    const isSafe = await checkPrompt(customPrompt);

    if (!isSafe) {
        document.getElementById('storyButton').classList.remove('disabled');
        return;
    }

    console.log('Target Age Group:', ageTarget);
    console.log('Story Length:', storyLength);
    console.log('Genre:', genre);
    console.log('Story Theme:', storyTheme);
    console.log('Setting:', setting);
    console.log('Protagonist:', protagonist);
    console.log('Custom Prompt:', customPrompt);
    
    const prompt = `
        As a professional storyteller, create a structured outline for a **${storyLength}** story in the **${genre}** genre, aimed at **${ageTarget}**. The story should follow a **${protagonist}** protagonist in a **${setting}** setting, exploring the theme of **${storyTheme}**. Consider **${customPrompt}** as additional elements to incorporate.
        The details emphasised with **text** are the user inputted parameters that should serve as the core of the story.
        Your task is to:
            1. Define the overarching narrative structure and flow of the story
            2. Break the story into logical parts (3-8 parts, as needed or requested)
            3. For each part, provide a brief description (2 sentences) that outlines:
                - The key events and plot developments
                - Character interactions and emotional beats
                - How this part connects to the overall narrative arc
            2. Write two sentences describing the overall story's core theme and intended style/tone
        This outline will serve as the foundation for expanding into a full story, so ensure it creates a complete, satisfying narrative journey with clear progression from setup to resolution.
        If any parameters are missing or contain errors, generate appropriate values that create a cohesive story concept.
        Finally, ensure the story is age-appropriate, using language and content suitable for the target audience.`;
    
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
        alert('Failed to generate story. Please try again.');
        document.getElementById('storyButton').classList.remove('disabled');
        throw error;
    }

    chatHistory.splice(0, 1);
    chatHistory.splice(2, 1);
});

function displayStory(story, id) {
    const storySection = document.createElement('section');
    storySection.id = id;
    storySection.className = 'main style2';
    
    let storyContentHTML = '';

    for (let i = 1; i <= Object.keys(story.story).length; i++) {
        storyContentHTML += `
            ${i % 2 !== 0 ? `
            <div class="row gtr-150 aln-middle aln-center">
                <div class="col-6 col-12-small align-right">
                    <p>${story.story[i]}</p>
                </div>` : `<div class="row gtr-150 aln-middle aln-center left-column">`}

            <div class="col-6 col-12-small align-center">
                <span class="image fit ai-image">
                    <img src="https://image.pollinations.ai/prompt/${story.image_prompts[i]}, ${story.image_style_tags}?width=500&height=300&nologo=true&safe=true" onerror="this.src=this.src + '&seed=${Math.floor(Math.random() * 99999)}';">
                </span>
            </div>

            ${i % 2 === 0 ? `
                <div class="col-6 col-12-small">
                    <p>${story.story[i]}</p>
                </div>` : ``}
        </div>`;
    }

    storySection.innerHTML = `
        <div class="background-blur">
            <div class="container">
                <h1 class="align-center">${story.title}</h1>
                ${storyContentHTML}
            </div>
        </div>`;
    
    document.body.insertBefore(storySection, document.getElementById('footer'));
    document.getElementById(`${id}Button`).classList.remove('disabled');
    storySection.scrollIntoView({ behavior: 'smooth' });

    if (id === 'adjustment') {
        document.getElementById('footeradjust').style.display = 'block';
    }
}

async function adjustStory() {
    if (document.getElementById('adjustmentButton').classList.contains('disabled')) {
        return;
    }
    document.getElementById('adjustmentButton').classList.add('disabled');

    const existingAdjustment = document.getElementById('adjustment');
    if (existingAdjustment) {
        existingAdjustment.remove();
    }

    const adjustmentType = document.getElementById('adjustmentType').value;
    let storyPart = '';
    if (adjustmentType === 'specific') {
        storyPart = document.getElementById('storyPart').value;
    }
    const lengthChange = document.getElementById('lengthChange').value;
    const plotChange = document.getElementById('plotChange').value;
    const characterChange = document.getElementById('characterChange').value;
    const styleChange = document.getElementById('styleChange').value;
    const adjustmentDetails = document.getElementById('adjustmentDetails').value;

    const isSafe = await checkPrompt(adjustmentDetails);

    if (!isSafe) {
        document.getElementById('adjustmentButton').classList.remove('disabled');
        return;
    }

    console.log('Adjustment Type:', adjustmentType);
    if (adjustmentType === 'specific') {
        console.log('Story Part:', storyPart);
    }
    console.log('Adjustment Details:', adjustmentDetails);

    const adjustment = `
        As a professional storyteller, modify the provided story according to these parameters, if any are empty, do not make changes related to that parameter:
        Adjustment Scope: ${adjustmentType === 'specific' ? `Part ${storyPart} only` : 'Entire story'}
        Changes Requested:
            Length: ${lengthChange}
            Plot: ${plotChange}
            Characters: ${characterChange}
            Style: ${styleChange}
            Additional Details: ${adjustmentDetails}
        Requirements:
            - Maintain the story's age-appropriateness and core elements
            - Keep parts around 250 words (split if necessary)
            - Ensure smooth transitions between adjusted and unchanged parts
            - Update image prompts only if the old ones no longer match the story
            - Do not change the image style tags unless tone/theme changes significantly as this forces all images to be regenerated
            - Make only the requested changes while preserving the story's overall coherence and quality.
        Return the modified story in the original JSON format:
        {
            "title": "The Story Title",
            "story": {
                "1": "Expanded narrative of part 1...",
                "2": "Expanded narrative of part 2...",
                [additional parts as needed]
            },
            "image_prompts": {
                "1": "Detailed visual description for part 1...",
                "2": "Detailed visual description for part 2...",
                [additional prompts as needed]
            },
            "image_style_tags": "artistic style tags appropriate for age group and genre"
        }`

    if (chatHistory.length === 6) {
        chatHistory = chatHistory.splice(2, 2);
    }

    chatHistory.push({
        role: 'user',
        content: adjustment
    });

    try {
        const story = await generateStory(true);
        displayStory(story, 'adjustment');

        const storyPartSelect = document.getElementById('storyPart');
    
        if (storyPartSelect) {
            storyPartSelect.innerHTML = Object.keys(story.story).map(num => 
                `<option value="${num}">Part ${num}</option>`
            ).join('')
        }
    } catch (error) {
        alert('Failed to adjust the story. Please try again.');
        document.getElementById('adjustmentButton').classList.remove('disabled');
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
            <h1 class="align-center"><strong>Adjust</strong> Your Story</h1>
            <form id="adjustmentForm" class="form-style">
				<div class="row gtr-uniform">
                    <div class="col-6 col-12-xsmall col-12">
                        <label for="adjustmentType">Apply adjustments to?</label>
                        <select id="adjustmentType" name="adjustmentType">
                            <option value="entire">Entire story</option>
                            <option value="specific">Specific part</option>
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

                    <div class="col-6 col-12-xsmall" id="lengthOptions">
                        <label for="lengthChange">Length Adjustment</label>
                        <select name="lengthChange" id="lengthChange">
                            <option value="">- Select Length Change -</option>
                            <option value="much-shorter">Much Shorter</option>
                            <option value="slightly-shorter">Slightly Shorter</option>
                            <option value="slightly-longer">Slightly Longer</option>
                            <option value="much-longer">Much Longer</option>
                        </select>
                    </div>

                    <div class="col-6 col-12-xsmall" id="plotOptions">
                        <label for="plotChange">Plot Modification</label>
                        <select name="plotChange" id="plotChange">
                            <option value="">- Select Plot Change -</option>
                            <option value="pacing">Change Pacing</option>
                            <option value="conflict">Modify Conflict</option>
                            <option value="story-arc">Alter Story Arc</option>
                            <option value="ending">Revise Ending</option>
                            <option value="plot-twist">Add Plot Twist</option>
                            <option value="description">Enhance Description</option>
                        </select>
                    </div>

                    <div class="col-6 col-12-xsmall" id="characterOptions">
                        <label for="characterChange">Character Adjustment</label>
                        <select name="characterChange" id="characterChange">
                            <option value="">- Select Character Change -</option>
                            <option value="main-character">Develop Main Character</option>
                            <option value="character-details">Add Character Details</option>
                            <option value="relationships">Modify Relationships</option>
                            <option value="add-character">Introduce New Character</option>
                            <option value="remove-character">Remove Character</option>
                        </select>
                    </div>

                    <div class="col-6 col-12-xsmall" id="styleOptions">
                        <label for="styleChange">Style Refinement</label>
                        <select name="styleChange" id="styleChange">
                            <option value="">- Select Style Change -</option>
                            <option value="descriptive">More Descriptive</option>
                            <option value="dialogue">More Dialogue</option>
                            <option value="action">More Action</option>
                            <option value="monologue">More Internal Monologue</option>
                            <option value="perspective">Change Narrative Perspective</option>
                            <option value="complexity">Adjust Language Complexity</option>
                        </select>
                    </div>

                    <div class="col-12">
                        <label for="adjustmentDetails">Describe your requested changes:</label>
                        <textarea 
                            id="adjustmentDetails" 
                            name="adjustmentDetails"
                            maxlength="100"
                            placeholder="Add extra details about what you'd like to change..."
                        ></textarea>
                    </div>

                    <div class="col-12">
                        <ul class="actions special">
                            <li><input id="adjustmentButton" type="submit" value="Adjust Story" class="button" /></li>
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