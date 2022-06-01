# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.12.0] - 2022-06-01
### Added
- Accepts Order Form ID via querystring

## [0.11.1] - 2021-05-05
### Added
- Splunk logger to order-manager package

## [0.11.0] - 2021-04-30
### Added
- Use `@vtex/order-manager` package.

## [0.10.0] - 2021-04-19

### Added
- `refreshOutdatedData` field in `orderForm` mutation

## [0.9.0] - 2020-12-16
### Added
- Property `index` to cancelled event errors.

## [0.8.9] - 2020-12-07
### Changed
- Update fetch policy on orderForm query to `no-cache`.

## [0.8.8] - 2020-11-24
### Changed
- Emit toasts with orderForm `generalMessages`.

## [0.8.7] - 2020-09-28
### Changed
- Replace `splunk-events` lib with `vtex.checkout-splunk`.

## [0.8.6] - 2020-09-14
### Fixed
- Order form updated to stale data if authentication state changed (checked via `orderForm.canEditData`).

## [0.8.5] - 2020-06-17
### Changed
- Delay minicart state if user isn't offline until orderForm query completes.

## [0.8.4] - 2020-03-31
### Fixed
- Re-enable orderForm id heuristics.

## [0.8.3] - 2020-03-27
### Fixed
- Order form isn't updated when `canEditData` property differs.

## [0.8.2] - 2020-03-04
### Removed
- `axios` dependency.

## [0.8.1] - 2020-02-27 [YANKED]
### Changed
- Update local order form if the server returns an order form with a different id.

## [0.8.0] - 2020-02-19
### Changed
- Save order form in `localStorage` to enable offline use-cases.
- Update `TaskQueue#enqueue` function to be network-aware when executing the task.

## [0.7.2] - 2020-02-19
### Changed
- Use the separate `default export`s from `vtex.checkout-resources`.

## [0.7.1] - 2020-02-04
### Changed
- Use typings exported by `vtex.checkout-graphql`.
- Improved linter and fixed resulting errors.

## [0.7.0] - 2020-01-30

### Added

- `id` to OrderForm.

## [0.6.9] - 2019-12-30
### Added
- Cache to `OrderForm` query in Apollo.

### Fixed
- OrderForm data in Apollo's cache is now updated when the local OrderForm is modified.

## [0.6.8] - 2019-12-27
### Removed
- Cache from `OrderForm` query.

## [0.6.7] - 2019-12-20
### Fixed
- `loading` property from the `OrderFormContext` being set to `false` before the order form was updated with the proper values.

## [0.6.6] - 2019-12-13
### Added
- `error` property returned by the order form GraphQL query to the `OrderFormContext`.
- Log to Splunk when the order form query fails.

## [0.6.5] - 2019-12-09
### Fixed
- Warnings from tests.

## [0.6.4] - 2019-12-09
### Fixed
- Typings of `OrderQueue` context to have a `CancellablePromiseLike` return
  value for the `enqueue` function.

## [0.6.3] - 2019-11-19
### Fixed
- This app was breaking in IE11 due to a module not exporting code compatible with it.

## [0.6.2] - 2019-11-12
### Fixed
- `loading` attribute would not be updated on `OrderFormContext`.
- `orderForm` query being executed during SSR.

## [0.6.1] - 2019-11-12
### Fixed
- A new component tree would be mounted after the `orderForm` query was completed.

## [0.6.0] - 2019-11-06
### Added
- Function `isWaiting` to determine whether a task with the specified `id` is still in the queue.

## [0.5.0] - 2019-10-29
### Added
- `dummyOrderForm` file in order to display `product-list` preview skeleton.

## [0.4.0] - 2019-10-04
### Added
- `useQueueStatus` hook and `QueueStatus` enum to `OrderQueue`.

## [0.3.3] - 2019-09-10
### Changed
- Moved `README.md` location to comply with IO Docs Builder requirements.

## [0.3.2] - 2019-09-10
### Changed
- A running task is not cancelled anymore when another task with same `id` is pushed to the queue.

## [0.3.1] - 2019-09-05
### Changed
- GraphQL queries are now imported from `checkout-resources`.

## [0.3.0] - 2019-08-29
### Added
- Order form provider.

## [0.2.0] - 2019-08-22
### Changed
- When a task is cancelled, the rejected promise now returns an object with error code and message.

## [0.1.2] - 2019-08-21
### Fixed
- Fixed tests that were broken in v0.1.1.

## [0.1.1] - 2019-08-20
### Changed
- `OrderManagerProvider` and `useOrderManager` are now `export default`'ed from `OrderManager.tsx`.

## [0.1.0] - 2019-08-19
### Added
- Initial version of OrderManager
