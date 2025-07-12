import { NextRequest, NextResponse } from 'next/server'
import { generateLessonPlan } from '@/lib/openai'
import logger from '@/lib/logger'

export async function POST(request: NextRequest) {
  logger.info('🌐 API /generate-plan endpoint called')
  const startTime = Date.now()
  
  try {
    logger.info('📥 Parsing request body...')
    const body = await request.json()
    logger.info('📋 Request body received', { body })
    
    const { topic, depth } = body

    if (!topic || !depth) {
      logger.error('❌ Missing required fields', { topic: !!topic, depth: !!depth })
      return NextResponse.json(
        { error: 'Topic and depth are required' },
        { status: 400 }
      )
    }

    logger.info('✅ Request validation passed')
    logger.info('🔄 Calling generateLessonPlan...')
    
    const lessons = await generateLessonPlan(topic, depth)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    logger.info('🎉 Lesson plan generation completed successfully!')
    logger.info('⏱️ Total API call duration', { duration })
    logger.info('📤 Returning lessons to client', { lessonCount: lessons.length })
    
    return NextResponse.json({ lessons })
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    logger.error('🚨 API Error', { 
      duration, 
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : String(error)
    })
    
    return NextResponse.json(
      { error: 'Failed to generate lesson plan' },
      { status: 500 }
    )
  }
}