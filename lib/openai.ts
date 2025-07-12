import OpenAI from 'openai'
import { MIN_LESSONS, MAX_LESSONS, MIN_LESSON_LENGTH, MAX_LESSON_LENGTH } from './constants'
import logger from './logger'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface LessonPlanData {
  id: string
  title: string
  description: string
  duration: number
}

export async function generateLessonPlan(topic: string, depth: string): Promise<LessonPlanData[]> {
  logger.info('🤖 OpenAI generateLessonPlan called', { topic, depth })
  
  const depthContext = {
    simple: "Explain like I'm 5 years old - use very simple language, basic concepts, and relatable examples",
    normal: "High school level - use clear explanations with some technical terms, practical examples",
    advanced: "PhD/Researcher level - use technical language, advanced concepts, and detailed analysis"
  }
  
  logger.info('📄 Using depth context', { depthContext: depthContext[depth as keyof typeof depthContext] })

  const prompt = `Create a comprehensive audio learning plan for the topic: "${topic}"

Learning level: ${depthContext[depth as keyof typeof depthContext]}

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

  logger.info('📝 Generated prompt', { prompt })
  logger.info('🚀 Sending request to OpenAI...')
  
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
    
    logger.info('⚙️ OpenAI request config', {
      model: requestConfig.model,
      max_completion_tokens: requestConfig.max_completion_tokens,
      messages_count: requestConfig.messages.length
    })
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = await openai.chat.completions.create(requestConfig as any)

    logger.info('✅ OpenAI API call completed successfully')
    logger.info('📊 Usage stats', {
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
      total_tokens: completion.usage?.total_tokens
    })
    
    const response = completion.choices[0]?.message?.content
    logger.info('💬 Raw OpenAI response', { response })
    
    if (!response) {
      logger.error('❌ No response content from OpenAI')
      throw new Error('No response from OpenAI')
    }

    logger.info('🔄 Parsing JSON response...')
    // Parse the JSON response
    const lessons = JSON.parse(response) as LessonPlanData[]
    
    logger.info('📚 Parsed lessons', { 
      lessons: lessons.map((lesson, index) => ({
        index: index + 1,
        title: lesson.title,
        duration: lesson.duration,
        description: lesson.description.substring(0, 100) + (lesson.description.length > 100 ? '...' : '')
      }))
    })
    
    // Validate the response structure
    if (!Array.isArray(lessons) || lessons.length === 0) {
      logger.error('❌ Invalid lesson plan format - not an array or empty')
      throw new Error('Invalid lesson plan format')
    }
    
    logger.info('✅ Lesson plan validation passed', { lessonCount: lessons.length })
    return lessons
  } catch (error) {
    logger.error('💥 Error in generateLessonPlan', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stackTrace: error instanceof Error ? error.stack : undefined
    })
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
  logger.info('🤖 OpenAI generateLessonContent called', {
    topic,
    depth,
    lessonTitle,
    duration
  })
  
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

  logger.info('📝 Generated content prompt', { prompt })
  logger.info('🚀 Sending content request to OpenAI...')
  
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
    
    logger.info('⚙️ OpenAI content request config', {
      model: requestConfig.model,
      max_completion_tokens: requestConfig.max_completion_tokens,
      messages_count: requestConfig.messages.length
    })
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completion = await openai.chat.completions.create(requestConfig as any)

    logger.info('✅ OpenAI content API call completed successfully')
    logger.info('📊 Usage stats', {
      prompt_tokens: completion.usage?.prompt_tokens,
      completion_tokens: completion.usage?.completion_tokens,
      total_tokens: completion.usage?.total_tokens
    })
    
    const content = completion.choices[0]?.message?.content
    logger.info('💬 Raw OpenAI content response', { contentLength: content?.length || 0 })
    
    if (!content) {
      logger.error('❌ No content from OpenAI')
      throw new Error('No content from OpenAI')
    }

    logger.info('✅ Lesson content generation completed')
    return content.trim()
  } catch (error) {
    logger.error('💥 Error in generateLessonContent', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      stackTrace: error instanceof Error ? error.stack : undefined
    })
    throw new Error('Failed to generate lesson content. Please try again.')
  }
}