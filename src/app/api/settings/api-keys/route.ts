import { NextRequest, NextResponse } from 'next/server'
import { encrypt, decrypt, Encrypted } from '@/lib/crypto'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET handler to retrieve masked API key information for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication using JWT session
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Use the authenticated user's email
    const userEmail = user.email;

    // Try to find existing API credentials for this user
    const credentials = await prisma.apiCredential.findUnique({
      where: { userEmail }
    });

    // Prepare response object
    const response = {
      tally: { present: false },
      openai: { present: false }
    };

    // If we have credentials, check for keys and decrypt if present
    if (credentials) {
      // Process Tally API key if present
      if (credentials.tallyCipher && credentials.tallyIv && credentials.tallyTag) {
        try {
          const encrypted: Encrypted = {
            cipher: credentials.tallyCipher,
            iv: credentials.tallyIv,
            tag: credentials.tallyTag
          };
          
          const decrypted = decrypt(encrypted);
          response.tally = { 
            present: true, 
            last4: decrypted.slice(-4) 
          };
        } catch (error) {
          console.error('Failed to decrypt Tally API key:', error);
          // Keep present as false if decryption fails
        }
      }

      // Process OpenAI API key if present
      if (credentials.openaiCipher && credentials.openaiIv && credentials.openaiTag) {
        try {
          const encrypted: Encrypted = {
            cipher: credentials.openaiCipher,
            iv: credentials.openaiIv,
            tag: credentials.openaiTag
          };
          
          const decrypted = decrypt(encrypted);
          response.openai = { 
            present: true, 
            last4: decrypted.slice(-4) 
          };
        } catch (error) {
          console.error('Failed to decrypt OpenAI API key:', error);
          // Keep present as false if decryption fails
        }
      }
    }

    return NextResponse.json(response);
    
  } catch (error) {
    // Check if this is an encryption key error
    if (error instanceof Error && error.message.includes('ENCRYPTION_KEY')) {
      return NextResponse.json(
        { error: 'Server configuration error: ENCRYPTION_KEY not set' },
        { status: 500 }
      );
    }

    console.error('API keys fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API keys' },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update API keys for the current user
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication using JWT session
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Use the authenticated user's email
    const userEmail = user.email;

    // Parse request body
    const body = await request.json();
    const { tallyApiKey, openaiApiKey } = body;

    // Prepare data for upsert
    const data: any = {
      userEmail,
    };

    // Process Tally API key if provided
    if (tallyApiKey === null || tallyApiKey === '') {
      // Clear the key
      data.tallyCipher = null;
      data.tallyIv = null;
      data.tallyTag = null;
    } else if (tallyApiKey) {
      // Encrypt the key
      const encrypted = encrypt(tallyApiKey);
      data.tallyCipher = encrypted.cipher;
      data.tallyIv = encrypted.iv;
      data.tallyTag = encrypted.tag;
    }

    // Process OpenAI API key if provided
    if (openaiApiKey === null || openaiApiKey === '') {
      // Clear the key
      data.openaiCipher = null;
      data.openaiIv = null;
      data.openaiTag = null;
    } else if (openaiApiKey) {
      // Encrypt the key
      const encrypted = encrypt(openaiApiKey);
      data.openaiCipher = encrypted.cipher;
      data.openaiIv = encrypted.iv;
      data.openaiTag = encrypted.tag;
    }

    // Update or create the record
    await prisma.apiCredential.upsert({
      where: { userEmail },
      update: data,
      create: data,
    });

    // Return the updated keys information (same format as GET)
    // Prepare response object
    const response = {
      tally: { present: false },
      openai: { present: false }
    };

    // Check if keys are present after update
    if (tallyApiKey) {
      response.tally = { 
        present: true, 
        last4: tallyApiKey.slice(-4) 
      };
    } else if (tallyApiKey === null || tallyApiKey === '') {
      // Explicitly cleared
      response.tally = { present: false };
    } else {
      // Not provided in this request, fetch from database
      const credentials = await prisma.apiCredential.findUnique({
        where: { userEmail }
      });
      
      if (credentials?.tallyCipher && credentials?.tallyIv && credentials?.tallyTag) {
        try {
          const encrypted: Encrypted = {
            cipher: credentials.tallyCipher,
            iv: credentials.tallyIv,
            tag: credentials.tallyTag
          };
          
          const decrypted = decrypt(encrypted);
          response.tally = { 
            present: true, 
            last4: decrypted.slice(-4) 
          };
        } catch (error) {
          console.error('Failed to decrypt Tally API key:', error);
        }
      }
    }

    // Same logic for OpenAI key
    if (openaiApiKey) {
      response.openai = { 
        present: true, 
        last4: openaiApiKey.slice(-4) 
      };
    } else if (openaiApiKey === null || openaiApiKey === '') {
      // Explicitly cleared
      response.openai = { present: false };
    } else {
      // Not provided in this request, fetch from database
      const credentials = await prisma.apiCredential.findUnique({
        where: { userEmail }
      });
      
      if (credentials?.openaiCipher && credentials?.openaiIv && credentials?.openaiTag) {
        try {
          const encrypted: Encrypted = {
            cipher: credentials.openaiCipher,
            iv: credentials.openaiIv,
            tag: credentials.openaiTag
          };
          
          const decrypted = decrypt(encrypted);
          response.openai = { 
            present: true, 
            last4: decrypted.slice(-4) 
          };
        } catch (error) {
          console.error('Failed to decrypt OpenAI API key:', error);
        }
      }
    }

    return NextResponse.json(response);
    
  } catch (error) {
    // Check if this is an encryption key error
    if (error instanceof Error && error.message.includes('ENCRYPTION_KEY')) {
      return NextResponse.json(
        { error: 'Server configuration error: ENCRYPTION_KEY not set' },
        { status: 500 }
      );
    }

    console.error('API keys update error:', error);
    return NextResponse.json(
      { error: 'Failed to update API keys' },
      { status: 500 }
    );
  }
}
