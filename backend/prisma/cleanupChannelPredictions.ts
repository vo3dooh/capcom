import 'dotenv/config'
import { PrismaClient, BankrollChangeType } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const url = process.env.DATABASE_URL ?? 'file:./dev.db'

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url })
})

function parseArg(name: string): string {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`))
  return a ? a.slice(name.length + 3) : ''
}

async function main() {
  const slug = parseArg('slug') || 'capcom'

  const channel = await prisma.channel.findUnique({
    where: { slug },
    select: { id: true, startingBankroll: true }
  })

  if (!channel) {
    throw new Error(`Channel not found: ${slug}`)
  }

  await prisma.$transaction(async (tx) => {
    // 1) Найдём eventId всех прогнозов канала
    const preds = await tx.prediction.findMany({
      where: { channelId: channel.id },
      select: { id: true, eventId: true }
    })

    const eventIds = Array.from(new Set(preds.map((p) => p.eventId)))

    // 2) Удаляем прогнозы
    await tx.prediction.deleteMany({
      where: { channelId: channel.id }
    })

    // 3) Удаляем bankroll logs канала (все типы)
    await tx.channelBankrollLog.deleteMany({
      where: { channelId: channel.id }
    })

    // 4) Сбрасываем stats (можно delete, можно обнулить)
    await tx.channelStats.deleteMany({
      where: { channelId: channel.id }
    })

    // 5) Возвращаем банкролл к стартовому
    await tx.channel.update({
      where: { id: channel.id },
      data: { currentBankroll: channel.startingBankroll }
    })

    // 6) Удаляем events, которые были созданы под прогнозы и теперь не имеют прогнозов
    // (чтобы не снести реальные events, которые используются другими каналами)
    for (const eventId of eventIds) {
      const left = await tx.prediction.count({ where: { eventId } })
      if (left === 0) {
        await tx.event.delete({ where: { id: eventId } }).catch(() => {})
      }
    }
  })

  process.stdout.write(`Cleared predictions/stats/bankroll logs for channel "${slug}".\n`)
}

main()
  .catch((e) => {
    process.stderr.write(String(e?.message || e))
    process.stderr.write('\n')
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })