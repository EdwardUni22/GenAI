let chatHistory = [];

async function generateStory() {

    if (chatHistory.length > 3) {
        chatHistory = chatHistory.slice(-3);
    }

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
            alert('Prompt failed to generate a story. Please try again or adjust your prompt.');
            throw new Error('Failed to parse story response as JSON');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate story. Please try again.');
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
        You are a professional storyteller specialized in creating engaging narratives. If any of the following parameters are empty, generate appropriate values based on these rules. If any parameters contain spelling mistakes or grammatical errors, correct them in your response while maintaining the intended meaning.

        PARAMETER GENERATION RULES:
        - Generate an engaging, age-appropriate title that connects with the other provided parameters
        - If any parameter is empty, choose a suitable value based on the provided parameters

        STORY PARAMETERS:
        Target Age Group: ${ageTarget}
        Story Length: ${storyLength}
        Genre: ${genre}
        Story Theme: ${storyTheme}
        Setting: ${setting}
        Protagonist: ${protagonist}
        Additional Elements: ${customPrompt}

        REQUIREMENTS:
        1. Create a story that strictly adheres to:
        - Age-appropriate content and language for the target age group
        - Themes and elements from the provided or generated parameters
        - A cohesive narrative structure with engaging characters

        2. Story Structure:
        - Divide the story into a number of substantial parts
        - Each part should be one paragraph
        - Ensure smooth transitions between parts
        - First part: Introduction and setting the scene
        - Beginning-Middle parts: Development of plot and characters
        - Middle-End parts: Climax and resolution
        - Final part: Conclusion and closing remarks

        3. Content Guidelines:
        - Maintain consistent tone throughout
        - Include engaging dialogue when appropriate
        - Use descriptive language suitable for age group
        - Ensure all content is appropriate for target age
        - Incorporate specified parameters naturally into the story
        - Create rich, detailed scenes rather than brief summaries
        - Balance narrative, dialogue, and description in each part

        4. Image Prompts:
        - For each story part, create a focused image generation prompt that emphasizes:
            * Number and roles of people (e.g., "three teenagers", "a mother and child", "a group of warriors")
            * Setting and environment (e.g., "ancient library", "mountain peak", "underwater cave")
            * Time of day and atmospheric conditions (e.g., "misty dawn", "stormy night", "golden afternoon")
            * Key landmarks or objects (e.g., "crystal waterfall", "ruined tower", "magical portal")
            * Main action or scene composition (e.g., "exploring", "facing each other", "looking up at")
        - Avoid using specific character names or unnecessary narrative details
        - Ensure image content is age-appropriate
        - Match the story's tone and style
        - You must also provide a list of tags that will be appended to the end of each prompt, these tags will determine the style of the images and should be related to the story's themes and target age group

        Your response must be formatted as a valid JSON response according to the following structure, do not include any comments about what you've generated in your response:

        {
            "title": "The Story Title",
            "story": {
                "1": "First part of the story (opening chapter)...",
                "2": "Second part of the story (development)...",
                "3": "Third part of the story (conclusion)...",
                ...
            },
            "image_prompts": {
                "1": "Detailed image generation prompt for part 1...",
                "2": "Detailed image generation prompt for part 2...",
                "3": "Detailed image generation prompt for part 3...",
                ...
            },
            image_style_tags: "Tags related to the style of the images"
        }

        Remember to create an engaging, cohesive narrative that naturally incorporates all specified elements while maintaining appropriate content and language for the target age group. Each part should feel complete and substantial, like a proper chapter or scene in a book. Each image prompt should effectively visualize a key moment from its corresponding story part.`;
    
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
});

function displayStory(story, id) {
    const storySection = document.createElement('section');
    storySection.id = id;
    storySection.className = 'main style2';
    
    // Create the story content HTML
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
                    <img src="https://image.pollinations.ai/prompt/${story.image_prompts[i]}, ${story.image_style_tags}?width=500&height=300&nologo=true&safe=true" onerror="this.onerror=null; this.src=this.src;">
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
        You are a professional storyteller making adjustments to a previously generated story. Review the changes requested and the previous story's image prompts and style tags to ensure consistency.

        ADJUSTMENT PARAMETERS:
        Apply adjustments to: ${adjustmentType === 'specific' ? `Specific Part: Part ${storyPart}` : 'Entire story'}
        Length Adjustment: ${lengthChange}
        Plot Modification: ${plotChange}
        Character Adjustment: ${characterChange}
        Style Refinement: ${styleChange}
        Additional Adjustment Details: ${adjustmentDetails}

        PARAMETER INSTRUCTIONS:
        - Adjust the story based on the provided parameters and details
        - If any parameter is empty, do not make changes related to that parameter

        REQUIREMENTS:
        1. Story Maintenance:
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
        - If any part exceeds 400 words after adjustments, split it into multiple parts

        3. Image Content Review:
        - Review existing image prompts for modified or new parts
        - Ensure image prompts match any adjusted story content
        - Update or create new image prompts for split parts
        - Verify all image prompts maintain age-appropriate content
        - Avoid unnecessary and minor changes to image prompts
        - Review style tags for relevance with any tone or theme changes
        - Only change the image style tags if the story's tone or theme has significantly shifted

        Your response must maintain the same JSON format:
        {
            "title": "The Story Title",
            "story": {
                "1": "First substantial part...",
                "2": "Second substantial part...",
                "3": "Third substantial part...",
                ...
            },
            "image_prompts": {
                "1": "Detailed image generation prompt for part 1...",
                "2": "Detailed image generation prompt for part 2...",
                "3": "Detailed image generation prompt for part 3...",
                ...
            },
            "image_style_tags": "Tags related to the style of the images"
        }

        Make only the requested adjustments while ensuring all story parts, image prompts, and style tags remain cohesive and appropriate for the target audience.`;

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
                            <option value="motivations">Change Character Motivations</option>
                            <option value="dialogue">Adjust Character Dialogue</option>
                            <option value="character-arc">Enhance Character Arc</option>
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