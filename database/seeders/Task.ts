import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { TaskStatus } from 'Contracts/enums'
import { TaskFactory } from 'Database/factories'

export default class extends BaseSeeder {
  public async run() {
    await TaskFactory.createMany(10)
    await TaskFactory.apply(TaskStatus.InProgress).createMany(10)
    await TaskFactory.apply(TaskStatus.Completed).createMany(10)
  }
}
