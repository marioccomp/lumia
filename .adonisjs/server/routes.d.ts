import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'videos.list': { paramsTuple?: []; params?: {} }
    'datasets.list': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'videos.create': { paramsTuple?: []; params?: {} }
    'videos.created': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'videos.store': { paramsTuple?: []; params?: {} }
    'comments.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comments.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'commentId': ParamValue} }
    'videos.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'comments.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'commentId': ParamValue} }
    'videos.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'datasets.create': { paramsTuple?: []; params?: {} }
    'datasets.store': { paramsTuple?: []; params?: {} }
    'dataset.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'dataset.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
    'videos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'videos.list': { paramsTuple?: []; params?: {} }
    'datasets.list': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'videos.create': { paramsTuple?: []; params?: {} }
    'videos.created': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'datasets.create': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'dataset.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
    'videos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'videos.list': { paramsTuple?: []; params?: {} }
    'datasets.list': { paramsTuple?: []; params?: {} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'videos.create': { paramsTuple?: []; params?: {} }
    'videos.created': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'datasets.create': { paramsTuple?: []; params?: {} }
    'health_checks.live': { paramsTuple?: []; params?: {} }
    'dataset.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'health_checks.ready': { paramsTuple?: []; params?: {} }
    'videos.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'videos.store': { paramsTuple?: []; params?: {} }
    'comments.create': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'datasets.store': { paramsTuple?: []; params?: {} }
    'dataset.execute': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'comments.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'commentId': ParamValue} }
    'videos.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'comments.delete': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'commentId': ParamValue} }
    'videos.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}