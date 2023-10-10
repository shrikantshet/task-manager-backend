import Task from 'App/Models/Task'
import Factory from '@ioc:Adonis/Lucid/Factory'
import { TaskStatus } from 'Contracts/enums'

export const TaskFactory = Factory.define(Task, ({ faker }) => {
  return {
    title: faker.lorem.sentence(),
    status: TaskStatus.Open,
  }
})
  .state(TaskStatus.InProgress, (post) => (post.status = TaskStatus.InProgress))
  .state(TaskStatus.Completed, (post) => (post.status = TaskStatus.Completed))
  .build()
