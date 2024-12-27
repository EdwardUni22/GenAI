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
        - If Target Age Group is empty: Generate an appropriate age range based on these categories:
            * Children (5-12)
            * Young Adult (13-17)
            * Adult (18+)
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
                "1": "First substantial part of the story (opening chapter)...",
                "2": "Second substantial part of the story (development)...",
                "3": "Third substantial part of the story (conclusion)...",
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
        <div class="row gtr-150 aln-middle">
            ${i % 2 !== 0 ? `
                <div class="col-6 col-12-xsmall align-right">
                    <p>${story.story[i]}</p>
                </div>` : ``}

            <div class="col-6 col-12-xsmall align-center">
                <span class="image fit ai-image">
                    <img src="https://image.pollinations.ai/prompt/${story.image_prompts[i]}, ${story.image_style_tags}?width=500&height=300">
                </span>
            </div>

            ${i % 2 === 0 ? `
                <div class="col-6 col-12-xsmall">
                    <p>${story.story[i]}</p>
                </div>` : ``}
        </div>`;
    }

    storySection.innerHTML = `
        <div class="background-blur">
            <div class="container">
                <h2 class="align-center">${story.title}</h2>
                ${storyContentHTML}
            </div>
        </div>`;
    
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
        You are a professional storyteller making adjustments to a previously generated story. Review the changes requested and the previous story's image prompts and style tags to ensure consistency.

        ADJUSTMENT PARAMETERS:
        Type of Adjustment: ${adjustmentType}
        ${adjustmentType === 'specific' ? `Part to Adjust: Part ${storyPart}` : 'Adjust entire story'}
        Requested Changes: ${adjustmentDetails}

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
        - Review style tags for relevance with any tone or theme changes

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