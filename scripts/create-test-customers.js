const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createTestCustomers() {
  console.log('🏢 Creating test customers...')

  try {
    // Create test customers
    const customer1 = await prisma.customer.create({
      data: {
        companyName: 'TechCorp Solutions GmbH',
        street: 'Musterstraße 123',
        postalCode: '10115',
        city: 'Berlin',
        primaryContactFirstName: 'Max',
        primaryContactLastName: 'Mustermann',
        primaryContactRole: 'Geschäftsführer',
        primaryContactEmail: 'max.mustermann@techcorp.de',
        primaryContactPhone: '+49 30 12345678',
        status: 'ACTIVE'
      }
    })

    const customer2 = await prisma.customer.create({
      data: {
        companyName: 'Innovation AG',
        street: 'Innovationsplatz 1',
        postalCode: '80331',
        city: 'München',
        primaryContactFirstName: 'Sarah',
        primaryContactLastName: 'Johnson',
        primaryContactRole: 'Head of Operations',
        primaryContactEmail: 'sarah.johnson@innovation.de',
        primaryContactPhone: '+49 89 98765432',
        status: 'ACTIVE'
      }
    })

    const customer3 = await prisma.customer.create({
      data: {
        companyName: 'StartupLab GmbH',
        street: 'Startup Allee 42',
        postalCode: '20095',
        city: 'Hamburg',
        primaryContactFirstName: 'Peter',
        primaryContactLastName: 'Schmidt',
        primaryContactRole: 'CTO',
        primaryContactEmail: 'peter.schmidt@startuplab.com',
        primaryContactPhone: '+49 40 11223344',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Test customers created successfully:')
    console.log('🏢 TechCorp Solutions GmbH (Berlin)')
    console.log('🏢 Innovation AG (München)')  
    console.log('🏢 StartupLab GmbH (Hamburg)')

  } catch (error) {
    console.error('❌ Error creating test customers:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestCustomers()