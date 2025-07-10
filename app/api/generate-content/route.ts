import { NextRequest, NextResponse } from 'next/server'
import { generateLessonContent } from '@/lib/openai'
import logger from '@/lib/logger'

export async function POST(request: NextRequest) {
  logger.info('🌐 API /generate-content endpoint called')
  const startTime = Date.now()
  
  try {
    logger.debug('📥 Parsing request body...')
    const body = await request.json()
    logger.debug('📋 Request body:', { body })
    
    const { topic, depth, lessonTitle, lessonDescription, duration } = body

    if (!topic || !depth || !lessonTitle || !lessonDescription || !duration) {
      logger.error('❌ Missing required fields:', { 
        hasTopicField: !!topic, 
        hasDepthField: !!depth, 
        hasLessonTitleField: !!lessonTitle, 
        hasLessonDescriptionField: !!lessonDescription,
        hasDurationField: !!duration 
      })
      return NextResponse.json(
        { error: 'All lesson details are required' },
        { status: 400 }
      )
    }

    logger.info('✅ Request validation passed')
    logger.info('🔄 Calling generateLessonContent...')
    
    const content = await generateLessonContent(topic, depth, lessonTitle, lessonDescription, duration)
    
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    logger.info('🎉 Lesson content generation completed successfully!')
    logger.info('⏱️ Total API call duration:', { durationMs })
    logger.info('📤 Returning content:', { contentLength: content.length })
    
    return NextResponse.json({ content })
  } catch (error) {
    const endTime = Date.now()
    const durationMs = endTime - startTime
    
    logger.error('🚨 API Error:', {
      durationMs,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { error: 'Failed to generate lesson content' },
      { status: 500 }
    )
  }
}