import OpenAI from 'openai'
import { MIN_LESSONS, MAX_LESSONS, MIN_LESSON_LENGTH, MAX_LESSON_LENGTH } from './constants'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface LessonPlanData {
  id: string
  title: string
  description: string
  duration: number
}

export interface LearningPreferences {
  learningStyle: string
  pace: string
  interactivity: string
  examples: string
}

export async function generateLessonPlan(topic: string, depth: string, preferences?: LearningPreferences): Promise<LessonPlanData[]> {
  console.log('🤖 OpenAI generateLessonPlan called with:')
  console.log('  - Topic:', topic)
  console.log('  - Depth:', depth)
  console.log('  - Preferences:', preferences)
  
  const depthContext = {
    simple: "Explain like I'm 5 years old - use very simple language, basic concepts, and relatable examples",
    normal: "High school level - use clear explanations with some technical terms, practical examples",
    advanced: "PhD/Researcher level - use technical language, advanced concepts, and detailed analysis"
  }
  
  console.log('📄 Using depth context:', depthContext[depth as keyof typeof depthContext])

  // Build personalization context based on preferences
  let personalizationContext = ""
  if (preferences) {
    const learningStyleContext = {
      visual: "Include lessons that describe visual concepts, diagrams, and spatial relationships. Use descriptive imagery to help visualize concepts.",
      auditory: "Focus on clear verbal explanations, use storytelling, and emphasize listening-based learning techniques.",
      kinesthetic: "Emphasize practical applications, hands-on examples, and actionable steps the learner can apply immediately."
    }
    
    const paceContext = {
      slow: "Take time to thoroughly explain each concept. Use repetition and build understanding gradually. Allow for processing time between complex ideas.",
      normal: "Use a steady, comfortable pace with balanced explanations. Provide good depth without rushing.",
      fast: "Move efficiently through concepts. Assume quick comprehension and focus on key insights and advanced applications."
    }
    
    const interactivityContext = {
      high: "Include thought-provoking questions, scenarios for the listener to consider, and encourage active participation.",
      medium: "Balance explanation with occasional engagement points and reflective questions.",
      low: "Focus primarily on clear explanation and information delivery with minimal interruption."
    }
    
    const exampleContext = {
      many: "Provide multiple real-world examples and case studies for each concept to reinforce learning.",
      some: "Include well-chosen examples that clearly illustrate key concepts.",
      few: "Focus on conceptual understanding with minimal examples, emphasizing theoretical foundations."
    }

    personalizationContext = `
Personalization based on learning preferences:
- Learning Style: ${learningStyleContext[preferences.learningStyle as keyof typeof learningStyleContext] || "Use balanced approach"}
- Pace: ${paceContext[preferences.pace as keyof typeof paceContext] || "Use normal pacing"}
- Interactivity: ${interactivityContext[preferences.interactivity as keyof typeof interactivityContext] || "Use balanced engagement"}  
- Examples: ${exampleContext[preferences.examples as keyof typeof exampleContext] || "Use balanced examples"}

IMPORTANT: Apply these preferences thoughtfully throughout each lesson while maintaining educational quality and coherence.`
  }

  const prompt = `Create a comprehensive audio learning plan for the topic: "${topic}"

Learning level: ${depthContext[depth as keyof typeof depthContext]}
${personalizationContext}

Generate exactly ${MIN_LESSONS}-${MAX_LESSONS} lessons that build upon each other logically. Each lesson should be ${Math.floor(MIN_LESSON_LENGTH/60)}-${Math.floor(MAX_LESSON_LENGTH/60)} minutes long and designed for audio consumption.

For each lesson, provide:
1. A clear, engaging title (max 4 words) that hints at the key insight
2. A detailed description (2-3 sentences) explaining the specific learning outcome and why this lesson matters in the overall journey
3. Duration in minutes (${Math.floor(MIN_LESSON_LENGTH/60)}-${Math.floor(MAX_LESSON_LENGTH/60)} minutes each) - shorter for foundational concepts, longer for complex applications

Design principles:
- Start with concrete examples before abstract concepts
- Each lesson should answer one clear question or solve one specific problem
- Build curiosity for the next lesson (create natural progression hooks)
- Use storytelling and analogies appropriate for audio learning
- Ensure each lesson delivers a satisfying "aha moment" or practical insight

Return the response as a JSON array with this exact structure:
[
  {
    "id": "1",
    "title": "lesson title",
    "description": "detailed description of what this lesson covers and why it's important",
    "duration": 4
  }
]

The lesson sequence should feel like a guided journey from "I've never heard of this" to "I understand how to use this in my life/work."`

  console.log('📝 Generated prompt:')
  console.log(prompt)
  console.log('\n🚀 Sending request to OpenAI...')
  
  try {
    const requestConfig = {
      model: "o3-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator. Generate engaging, well-structured lesson plans that build knowledge progressively."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 2000
    }
    
    console.log('⚙️ OpenAI request config:', {
      model: requestConfig.model,
      max_completion_tokens: requestConfig.max_completion_tokens,
      messages_count: requestConfig.messages.length
    })
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = await openai.chat.completions.create(requestConfig as any)

    console.log('✅ OpenAI API call completed successfully')
    console.log('📊 Usage stats:', {
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
      total_tokens: completion.usage?.total_tokens
    })
    
    const response = completion.choices[0]?.message?.content
    console.log('💬 Raw OpenAI response:')
    console.log(response)
    
    if (!response) {
      console.error('❌ No response content from OpenAI')
      throw new Error('No response from OpenAI')
    }

    console.log('🔄 Parsing JSON response...')
    // Parse the JSON response
    const lessons = JSON.parse(response) as LessonPlanData[]
    
    console.log('📚 Parsed lessons:')
    lessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title} (${lesson.duration}m)`)
      console.log(`     ${lesson.description.substring(0, 100)}${lesson.description.length > 100 ? '...' : ''}`)
    })
    
    // Validate the response structure
    if (!Array.isArray(lessons) || lessons.length === 0) {
      console.error('❌ Invalid lesson plan format - not an array or empty')
      throw new Error('Invalid lesson plan format')
    }
    
    console.log('✅ Lesson plan validation passed:', lessons.length, 'lessons generated')
    return lessons
  } catch (error) {
    console.error('💥 Error in generateLessonPlan:')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    throw new Error('Failed to generate lesson plan. Please try again.')
  }
}

export async function generateLessonContent(
  topic: string, 
  depth: string, 
  lessonTitle: string, 
  lessonDescription: string, 
  duration: number
): Promise<string> {
  console.log('🤖 OpenAI generateLessonContent called with:')
  console.log('  - Topic:', topic)
  console.log('  - Depth:', depth)
  console.log('  - Lesson:', lessonTitle)
  console.log('  - Duration:', duration, 'minutes')
  
  const depthContext = {
    simple: "Explain like I'm 5 years old - use very simple language, basic concepts, and relatable examples",
    normal: "High school level - use clear explanations with some technical terms, practical examples",
    advanced: "PhD/Researcher level - use technical language, advanced concepts, and detailed analysis"
  }
  
  const prompt = `Create a detailed script for an audio lesson on the topic: "${topic}"

Learning level: ${depthContext[depth as keyof typeof depthContext]}
Lesson title: "${lessonTitle}"
Lesson description: "${lessonDescription}"
Target duration: ${duration} minutes (approximately ${duration * 150} words)

Create engaging audio content that:
- Opens with a hook or interesting question to grab attention
- Explains concepts clearly using storytelling and analogies
- Includes concrete examples and practical applications
- Uses conversational tone perfect for audio consumption
- Builds to a satisfying conclusion with key takeaways
- Flows naturally when spoken aloud

CRITICAL FORMATTING REQUIREMENTS:
- Keep each paragraph SHORT - only 2-3 sentences max
- Each paragraph should take 10-15 seconds to read aloud (approximately 25-40 words)
- Use line breaks to separate paragraphs
- This allows for smooth audio generation and playback

IMPORTANT: Return ONLY the spoken words that would be read aloud. Do NOT include:
- Stage directions or production cues (like "Music fades in", "Sound effect", etc.)
- Speaker labels or names
- Action descriptions in brackets or parentheses
- Any formatting or markdown
- Narrator instructions

Just write the exact words that should be spoken to the listener, as if you are directly teaching them through audio.`

  console.log('📝 Generated content prompt:')
  console.log(prompt)
  console.log('\n🚀 Sending content request to OpenAI...')
  
  try {
    const requestConfig = {
      model: "o3-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert educational content creator specializing in audio learning. Create engaging, conversational content perfect for listening."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_completion_tokens: 3000
    }
    
    console.log('⚙️ OpenAI content request config:', {
      model: requestConfig.model,
      max_completion_tokens: requestConfig.max_completion_tokens,
      messages_count: requestConfig.messages.length
    })
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = await openai.chat.completions.create(requestConfig as any)

    console.log('✅ OpenAI content API call completed successfully')
    console.log('📊 Usage stats:', {
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
      total_tokens: completion.usage?.total_tokens
    })
    
    const content = completion.choices[0]?.message?.content
    console.log('💬 Raw OpenAI content response length:', content?.length || 0, 'characters')
    
    if (!content) {
      console.error('❌ No content from OpenAI')
      throw new Error('No content from OpenAI')
    }

    console.log('✅ Lesson content generation completed')
    return content.trim()
  } catch (error) {
    console.error('💥 Error in generateLessonContent:')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    if (error instanceof Error && error.stack) {
      console.error('Stack trace:', error.stack)
    }
    throw new Error('Failed to generate lesson content. Please try again.')
  }
}