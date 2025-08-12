import { NextResponse } from 'next/server';
import { testRedisConnection } from '@/lib/test-redis';

/**
 * API route pour tester la connexion Redis
 * GET /api/test-redis
 */
export async function GET() {
  try {
    // Tester la connexion Redis
    await testRedisConnection();
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection test passed!',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Redis test failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Redis connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
