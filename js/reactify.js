/*!
 * @file Reactify.js
 * @description Микро-библиотека на чистых прототипах для реактивных событий (Event Emitter)
 * @version 1.1.0
 * @author minoyo flybuk@icloud.com
 * @license MIT
 * @homepage https://minoyo.click
 * 
 * Copyright (c) 2026 minoyo
 * Released under the MIT License
*/

const Reactify = () => {
    let listeners = Object.create(null)
    let history = new Map()

    const off = (eventName, fn) => {
        if (!listeners[eventName]) return
        listeners[eventName] = listeners[eventName].filter(func => func !== fn)
        if (!listeners[eventName]) delete listeners[eventName]
    }

    const on = (eventName, fn) => {
        if (listeners[eventName]) listeners[eventName].push(fn)
        else listeners[eventName] = [fn]
        return () => off(eventName, fn)
    }

    const once = (eventName, fn) => {
        const wrapper = (data) => {
            off(eventName, wrapper)
            fn(data)
        }
        on(eventName, wrapper)
    }

    const when = (eventName, fn) => {
        if (history.has(eventName)) fn(history.get(eventName))
        else once(eventName, fn)
    }

    const emit = (eventName, data) => {
        history.set(eventName, data)
        const fns = listeners[eventName]?.slice()
        fns?.forEach(fn => fn(data))
    }

    const has = (eventName) => listeners[eventName] ? true : false

    const clear = (eventName) => {
        if (!listeners[eventName]) return
        delete listeners[eventName]
    }

    const clearAll = () => {
        listeners = Object.create(null)
        history.clear()
    }

    const events = () => ({ ...listeners })

    const clearHistory = () => {
        if (eventName) history.delete(eventName)
        else history.clear()
    }

    return { on, off, once, when, emit, has, clear, clearAll, events, clearHistory }
}
