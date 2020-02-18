import moment from 'moment'
import messageDao from '@/dao/message_dao'
import { PerPageMessageCount } from '@/utils/constants'

class MessageBox {
  conversationId: any
  messagePositionIndex: any
  oldLastMessages: any
  scrollAction: any
  messages: any
  pageDown: any
  tempCount: any
  page: any
  callback: any
  count: any

  async setConversationId(conversationId: string, messagePositionIndex: number) {
    if (conversationId) {
      this.conversationId = conversationId
      this.messagePositionIndex = messagePositionIndex
      let page = 0
      if (messagePositionIndex >= PerPageMessageCount) {
        page = Math.floor(messagePositionIndex / PerPageMessageCount)
      }
      this.messages = messageDao.getMessages(conversationId, page)
      this.oldLastMessages = messageDao.getMessages(conversationId, 0)
      this.page = page
      this.pageDown = page
      this.tempCount = 0
      let posMessage = null
      if (messagePositionIndex > 0) {
        posMessage = this.messages[this.messages.length - (messagePositionIndex % PerPageMessageCount) - 1]
      }
      let newMessages: any = await this.nextPage('up')
      this.messages.unshift(...newMessages)

      if (this.page > 0) {
        newMessages = await this.nextPage('down')
        this.messages.push(...newMessages)
      }

      this.count = messageDao.getMessagesCount(conversationId)['count(m.message_id)']
      this.callback(this.messages)
      this.scrollAction(true, posMessage)
    }
  }
  clearMessagePositionIndex(index: any) {
    this.messagePositionIndex = index
  }
  refreshConversation(conversationId: any) {
    const page = 0
    this.page = page
    this.pageDown = page
    this.tempCount = 0
    this.messages = messageDao.getMessages(conversationId, page)
    this.callback(this.messages)
  }
  refreshMessage(payload: any) {
    const { conversationId, messageIds } = payload
    if (conversationId === this.conversationId && this.conversationId) {
      if (messageIds && messageIds.length > 0) {
        const matchIds: any = []
        let count = messageIds.length

        for (let i = this.messages.length - 1; i >= 0; i--) {
          const item = this.messages[i]
          if (count <= 0) {
            break
          }
          if (messageIds.indexOf(item.messageId) > -1) {
            count--
            matchIds.push(item.messageId)
            const findMessage = messageDao.getConversationMessageById(conversationId, item.messageId)
            if (findMessage) {
              findMessage.lt = moment(findMessage.createdAt).format('HH:mm')
              this.messages[i] = findMessage
            }
          }
        }
        if (matchIds.length !== messageIds.length) {
          messageIds.forEach((id: string) => {
            if (matchIds.indexOf(id) < 0) {
              const findMessage = messageDao.getConversationMessageById(conversationId, id)
              if (findMessage) {
                findMessage.lt = moment(findMessage.createdAt).format('HH:mm')
                this.messages.push(findMessage)
              }
            }
          })
        }
        this.callback(this.messages)
        return this.scrollAction(false)
      }
      console.log(9555)

      const syncMessageCount = 21
      const lastMessages = messageDao.getMessages(conversationId, 0, 0, syncMessageCount)
      if (this.messagePositionIndex >= PerPageMessageCount) {
        let newCount = 0
        for (let i = PerPageMessageCount - 1; i >= 0; i--) {
          const temp = lastMessages[i]
          if (temp.messageId === this.oldLastMessages[PerPageMessageCount - 1].messageId) {
            break
          }
          newCount++
        }
        if (newCount) {
          this.pageDown = Math.ceil(newCount / PerPageMessageCount)
          this.tempCount += newCount % PerPageMessageCount
        }

        return this.callback(null, newCount)
      }
      const lastMsgLen = lastMessages.length
      const msgLen = this.messages.length
      const beforeMessageId = this.messages[msgLen - 1] && this.messages[msgLen - 1].messageId
      let addTempCount = 0
      for (let i = lastMsgLen - 1; i >= 0; i--) {
        const temp = lastMessages[i]
        if (temp && msgLen > 0 && temp.messageId === beforeMessageId) {
          break
        }
        addTempCount++
        this.messages.push(temp)
      }
      for (let i = 1; i < lastMsgLen; i++) {
        const lastMessage = lastMessages[lastMsgLen - i]
        if (lastMessage.messageId === lastMessages[lastMsgLen - i - 1].messageId) {
          console.log('message duplicate')
          break
        }
        this.messages[this.messages.length - i] = lastMessage
      }
      this.callback(this.messages)
      let count = messageDao.getMessagesCount(conversationId)['count(m.message_id)']
      if (count >= this.count) {
        this.scrollAction(false)
      }
      this.count = count
      this.tempCount += addTempCount
    }
  }
  deleteMessages(messageIds: any[]) {
    messageDao.deleteMessagesById(messageIds)
    for (let i = this.messages.length - 1; i >= 0; i--) {
      if (messageIds[0] === this.messages[i].messageId) {
        this.messages.splice(i, 1)
        break
      }
    }
  }
  nextPage(direction: string): any {
    return new Promise(resolve => {
      let data: unknown = []
      if (direction === 'down') {
        if (this.pageDown > 0) {
          data = messageDao.getMessages(this.conversationId, --this.pageDown, -this.tempCount)
        }
      } else {
        data = messageDao.getMessages(this.conversationId, ++this.page, this.tempCount)
      }
      setTimeout(() => {
        resolve(data)
      })
    })
  }
  bindData(callback: any, scrollAction: any) {
    this.callback = callback
    this.scrollAction = scrollAction
  }
  clearData(conversationId: string) {
    if (conversationId === this.conversationId && this.conversationId) {
      this.page = 0
      this.messages = []
      this.count = 0
    }
  }
}

export default new MessageBox()
