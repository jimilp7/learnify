import { NextRequest, NextResponse } from 'next/server'
import { generateLessonPlan } from '@/lib/openai'
import { log } from '@/lib/logger'

export async function POST(request: NextRequest) {
  log.info('🌐 API /generate-plan endpoint called')
  const startTime = Date.now()
  
  try {
    log.debug('📥 Parsing request body...')
    const body = await request.json()
    log.debug('📋 Request body:', body)
    
    const { topic, depth } = body

    if (!topic || !depth) {
      log.error('❌ Missing required fields:', { topic: !!topic, depth: !!depth })
      return NextResponse.json(
        { error: 'Topic and depth are required' },
        { status: 400 }
      )
    }

    log.info('✅ Request validation passed')
    log.info('🔄 Calling generateLessonPlan...')
    
    const lessons = await generateLessonPlan(topic, depth)
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    log.info('🎉 Lesson plan generation completed successfully!')
    log.info('⏱️ Total API call duration:', { duration_ms: duration })
    log.info('📤 Returning lessons to client', { lesson_count: lessons.length })
    
    return NextResponse.json({ lessons })
  } catch (error) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    log.error('🚨 API Error', { duration_ms: duration })
    log.error('Error type:', { error_type: error instanceof Error ? error.constructor.name : typeof error })
    log.error('Error message:', { error_message: error instanceof Error ? error.message : String(error) })
    
    return NextResponse.json(
      { error: 'Failed to generate lesson plan' },
      { status: 500 }
    )
  }
}