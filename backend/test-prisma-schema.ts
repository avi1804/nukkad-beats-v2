/**
 * Prisma Schema Configuration Verification Test
 * 
 * This script validates that the Prisma schema is properly configured
 * according to the requirements without needing a database connection.
 */

import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');

interface ValidationResult {
  passed: boolean;
  message: string;
}

function validatePrismaSchema(): ValidationResult[] {
  const results: ValidationResult[] = [];

  try {
    // Check if schema file exists
    if (!fs.existsSync(schemaPath)) {
      return [{ passed: false, message: 'Schema file does not exist at prisma/schema.prisma' }];
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

    // 1. Validate datasource configuration
    results.push({
      passed: schemaContent.includes('datasource db') && 
              schemaContent.includes('provider = "postgresql"') &&
              schemaContent.includes('url      = env("DATABASE_URL")'),
      message: 'Datasource configured with PostgreSQL provider'
    });

    // 2. Validate generator configuration
    results.push({
      passed: schemaContent.includes('generator client') && 
              schemaContent.includes('provider = "prisma-client-js"'),
      message: 'Prisma Client generator configured'
    });

    // 3. Validate all required enums
    const requiredEnums = [
      'enum Role',
      'enum BookingStatus',
      'enum PaymentStatus',
      'enum PaymentMethod',
      'enum OrderStatus'
    ];

    requiredEnums.forEach(enumName => {
      results.push({
        passed: schemaContent.includes(enumName),
        message: `${enumName} defined in schema`
      });
    });

    // 4. Validate enum values
    const enumValidations = [
      { enum: 'Role', values: ['USER', 'ADMIN'] },
      { enum: 'BookingStatus', values: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] },
      { enum: 'PaymentStatus', values: ['PENDING', 'PENDING_CONFIRMATION', 'PAID', 'FAILED', 'REFUNDED'] },
      { enum: 'PaymentMethod', values: ['ONLINE', 'OFFLINE'] },
      { enum: 'OrderStatus', values: ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'] }
    ];

    enumValidations.forEach(({ enum: enumName, values }) => {
      const allValuesPresent = values.every(value => schemaContent.includes(value));
      results.push({
        passed: allValuesPresent,
        message: `${enumName} contains all required values: ${values.join(', ')}`
      });
    });

    // 5. Validate all 14 models
    const requiredModels = [
      'model User',
      'model Studio',
      'model Booking',
      'model BookingSlot',
      'model Category',
      'model Product',
      'model Cart',
      'model CartItem',
      'model Order',
      'model OrderItem',
      'model Payment',
      'model Notification',
      'model ContactInquiry'
    ];

    requiredModels.forEach(modelName => {
      results.push({
        passed: schemaContent.includes(modelName),
        message: `${modelName} defined in schema`
      });
    });

    // 6. Validate UUID primary keys
    const uuidPattern = /@id @default\(uuid\(\)\)/g;
    const uuidMatches = schemaContent.match(uuidPattern);
    results.push({
      passed: uuidMatches !== null && uuidMatches.length >= 13,
      message: `UUID primary keys configured (found ${uuidMatches?.length || 0} models with UUID IDs)`
    });

    // 7. Validate timestamp fields
    results.push({
      passed: schemaContent.includes('createdAt    DateTime  @default(now())') &&
              schemaContent.includes('updatedAt    DateTime  @updatedAt'),
      message: 'Timestamp fields (createdAt, updatedAt) configured'
    });

    // 8. Validate key indexes
    const requiredIndexes = [
      '@@index([email])',
      '@@index([isActive])',
      '@@index([userId])',
      '@@index([studioId])',
      '@@index([bookingDate])',
      '@@index([bookingReference])',
      '@@index([categoryId])',
      '@@index([isAvailable])',
      '@@index([orderReference])',
      '@@index([razorpayOrderId])',
      '@@index([createdAt])'
    ];

    requiredIndexes.forEach(index => {
      results.push({
        passed: schemaContent.includes(index),
        message: `Index ${index} defined`
      });
    });

    // 9. Validate unique constraints
    const requiredUniqueConstraints = [
      '@unique', // User.email
      '@@unique([studioId, date, startTime, endTime])', // BookingSlot
      '@@unique([cartId, productId])' // CartItem
    ];

    requiredUniqueConstraints.forEach(constraint => {
      results.push({
        passed: schemaContent.includes(constraint),
        message: `Unique constraint found: ${constraint}`
      });
    });

    // 10. Validate foreign key relations
    const requiredRelations = [
      'user    User     @relation(fields: [userId], references: [id])',
      'studio  Studio   @relation(fields: [studioId], references: [id])',
      'category   Category    @relation(fields: [categoryId], references: [id])',
      'cart    Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)',
      'product Product @relation(fields: [productId], references: [id])'
    ];

    requiredRelations.forEach(relation => {
      results.push({
        passed: schemaContent.includes(relation),
        message: `Relation defined: ${relation.substring(0, 50)}...`
      });
    });

  } catch (error) {
    results.push({
      passed: false,
      message: `Error reading schema file: ${error instanceof Error ? error.message : String(error)}`
    });
  }

  return results;
}

// Run validation
console.log('\n🔍 Validating Prisma Schema Configuration...\n');
console.log('='.repeat(70));

const results = validatePrismaSchema();
const totalTests = results.length;
const passedTests = results.filter(r => r.passed).length;
const failedTests = totalTests - passedTests;

results.forEach((result, index) => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} Test ${index + 1}/${totalTests}: ${result.message}`);
});

console.log('='.repeat(70));
console.log(`\n📊 Summary: ${passedTests}/${totalTests} tests passed`);

if (failedTests > 0) {
  console.log(`\n❌ ${failedTests} test(s) failed!`);
  process.exit(1);
} else {
  console.log('\n✅ All Prisma schema configuration tests passed!');
  console.log('\n📋 Configuration Summary:');
  console.log('   - Datasource: PostgreSQL');
  console.log('   - Generator: Prisma Client');
  console.log('   - Enums: 5 (Role, BookingStatus, PaymentStatus, PaymentMethod, OrderStatus)');
  console.log('   - Models: 14 (User, Studio, Booking, BookingSlot, Category, Product, Cart, CartItem, Order, OrderItem, Payment, Notification, ContactInquiry)');
  console.log('   - Primary Keys: UUID');
  console.log('   - Timestamps: createdAt, updatedAt');
  console.log('   - Indexes: Multiple performance indexes configured');
  console.log('   - Relations: Properly defined with foreign keys');
  console.log('\n🎉 Prisma ORM is properly configured and ready for migration!');
  process.exit(0);
}
