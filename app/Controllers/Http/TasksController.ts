import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { TaskStatus } from 'Contracts/enums'
import Task from 'App/Models/Task'
import Database from '@ioc:Adonis/Lucid/Database'
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

  public async update({ request, params, response }: HttpContextContract) {
    const inputs = schema.create({
      title: schema.string.optional(),
      status: schema.enum.optional(Object.values(TaskStatus)),
    })

    const payload = await request.validate({ schema: inputs })

    const id = params.id

    try {
      const task = await Task.findOrFail(id)

      task.title = payload.title || task.title
      task.status = payload.status || task.status
      const updatedTask = await task.save()

      return response.status(200).send({
        data: updatedTask,
        message: null,
      })
    } catch (error) {
      return response.status(404)
    }
  }

  public async count({ response }: HttpContextContract) {
    const metrics = await Database.from('tasks').groupBy('status').select('status').count({
      count: '*',
    })

    const result: { [key: string]: number } = {}

    metrics.map((i) => {
      const keyName = i.status.replace('_', '') + '_tasks'
      result[keyName] = i.count ? parseInt(i.count, 10) : 0
    })

    Object.values(TaskStatus).forEach((status) => {
      const keyName = status.replace('_', '') + '_tasks'
      if (!result[keyName]) {
        result[keyName] = 0
      }
    })

    return response.status(200).send({
      data: {
        metrics: result,
      },
      message: null,
    })
  }
}
