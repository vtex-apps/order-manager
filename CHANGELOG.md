# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
