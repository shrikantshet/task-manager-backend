import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TaskStatus } from 'Contracts/enums'
import Task from 'App/Models/Task'
import { schema } from '@ioc:Adonis/Core/Validator'

export default class TasksController {
  public async index({ request, response }: HttpContextContract) {
    const inputs = schema.create({
      page: schema.number.optional(),
      pageSize: schema.number.optional(),
    })

    const payload = await request.validate({ schema: inputs })

    const defaultPageSize = 10
    const tasks = await Task.query().paginate(
      payload.page || 1,
      payload.pageSize || defaultPageSize
    )

    const jsonFormattedTasks = tasks.toJSON()

    return response.status(200).send({
      data: jsonFormattedTasks,
      message: null,
    })
  }

  public async create({ request, response }: HttpContextContract) {
    const inputs = schema.create({
      title: schema.string(),
      status: schema.enum.optional(Object.values(TaskStatus)),
    })

    const payload = await request.validate({ schema: inputs })

    const task = await Task.create({
      title: payload.title,
      status: payload.status || TaskStatus.Open,
    })

    return response.status(201).send({
      data: task,
      message: null,
    })
  }
}
