# SDK Core Issues and Improvement Suggestions 

The content bellow is **NOT** AI Generated, only AI Assisted/Argument/Layout/Rephrase.

## 1. Should Implement DDD Principles

The current SDK design does not fully adhere to Domain-Driven Design (DDD) principles. By implementing DDD, we can better organize the codebase around the core business logic and domain models, leading to improved maintainability and scalability. This involves defining clear boundaries for different domains, using aggregates to encapsulate related entities, and employing repositories for data access.

Because the lack of DDD, the current project also have many issues:

- Why we have `com.innova.sdk_core.utils` and `com.innova.sdk_utils`, which are utility packages but located in different modules? This may cause confusion about where to find utility functions and lead to code duplication.

- Why we need to centralize all model into this `com.innova.sdk_models` package? This may lead to a bloated models package that is hard to navigate and maintain. Instead, we should consider organizing models according to their respective domains.

- And what is the purpose of `CommunicationInterface` in package `com.innova.sdk_com.interfaces` when we already have `com.innova.sdk_core.interfaces`?

These are only some examples of the confusion caused by the current structure.

By using DDD + Factory Pattern + Strategy Pattern + Facade Pattern, we will have this structure:

### Tree Structure

```markdown
com.innova.sdk_core/
├── devide/
│   ├── domain/
│   │   ├── model/
│   │   │   └── Device.kt
│   │   └── service/
│   │       ├── DeviceService.kt
│   │       └── impl/
│   │           ├── ScanDevices.kt
│   │           └── GetConnectedDeviceInfo.kt
│   ├── strategy/
│   │   ├── <<DeviceStrategy>>.kt
│   │   ├── BatteryDeviceStrategy.kt
│   │   ├── PassthruDeviceStrategy.kt
│   │   └── VciDeviceStrategy.kt
│   └── factory/
│       └── DeviceFactory.kt
├── connection/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── ConnectionConfig.kt
│   │   │   ├── ConnectionError.kt
│   │   │   ├── ConnectionResult.kt
│   │   │   └── ConnectionState.kt
│   │   └── service/
│   │       ├── ConnectionService.kt
│   │       └── impl/
│   │           ├── EstablishConnection.kt
│   │           └── TerminateConnection.kt
│   ├── strategy/
│   │   ├── <<ConnectionStategy>>.kt
│   │   ├── BLEConnectionStrategy.kt
│   │   └── SerialConnectionStrategy.kt
│   └── factory/
│       └── ConnectionFactory.kt
├── command/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── CommandRequest.kt
│   │   │   ├── CommandResponse.kt
│   │   │   ├── CommandResult.kt
│   │   │   └── CommandExeption.kt
│   │   └── handler/
│   │       ├── CommandBuilder.kt
│   │       ├── CommandExecutor.kt
│   │       └── CommandValidator.kt
│   ├── strategy/
│   │   ├── <<CommandStrategy>>.kt
│   │   ├── PassthruCommandStrategy.kt
│   │   ├── VciCommandStrategy.kt
│   │   └── BatteryCommandStrategy.kt
│   └── factory/
│       └── CommandFactory
├── commandQueue/
│   └── domain/
│       ├── model/
│       │   ├── CommandQueueTimeout.kt
│       │   ├── CommandQueueItem.kt
│       │   └── CommandQueueException.kt
│       └── service/
│           └── CommandQueueService.kt
├── database/
│   └── domain/
│       ├── model/
│       │   ├── QueryResult.kt
│       │   ├── DatabaseConfig.kt
│       │   └── DatabaseInfo.kt
│       └── service/
│           ├── DatabaseService.kt
│           └── impl/
│               ├── EstablishDatabaseConnection.kt
│               ├── GetDatabaseVersion.kt
│               ├── DisconnectDatabase.kt
│               ├── FetchQuery.kt
│               └── QueryRecord.kt
├── cache/
│   └── domain/
│       ├── model/
│       │   ├── CacheEntry.kt
│       │   └── CacheConfig.kt
│       └── service/
│           ├── CacheService.kt
│           └── impl/
│               ├── GetCacheData.kt
│               ├── SetCacheData.kt
│               └── ClearCache.kt
├── battery/
│   ├── domain/
│   │   └── model/
│   │       └── Vbat.kt
│   ├── service/
│   │   ├── BatteryService.kt
│   │   └── impl/
│   │       ├── GetVBat.kt
│   │       ├── HandleAltornatorTest.kt
│   │       └── HandleBatteryTest.kt
│   ├── strategy/
│   │   ├── <<BatteryStrategy>>.kt
│   │   ├── PassthruBatteryStrategy.kt
│   │   ├── BatteryBatteryStrategy.kt
│   │   └── VciBatteryStrategy.kt
│   └── factory/
│       └── BatteryFactory.kt
├── obd2/
│   ├── domain/
│   │   ├── Obd2Dtc.kt
│   │   ├── Obd2LiveDataItem.kt
│   │   ├── Obd2FreezeFrame.kt
│   │   └── ...
│   ├── parser/
│   │   ├── DecodeVin.kt
│   │   ├── Obd2DtcParser.kt
│   │   └── ...
│   ├── service/
│   │   ├── Obd2Service.kt
│   │   └── impl/
│   │       ├── GetVin.kt
│   │       ├── GetRPM.kt
│   │       ├── GetVSS.kt
│   │       ├── GetMode05.kt
│   │       ├── GetMode06.kt
│   │       ├── GetMode08.kt
│   │       ├── GetMode09.kt
│   │       ├── CheckPidSupport.kt
│   │       ├── GetLiveDate.kt
│   │       ├── GetLedLogic.kt
│   │       └── ...
│   ├── strategy/
│   │   ├── <<Obd2Strategy>>.kt
│   │   ├── PassthruObd2Strategy.kt
│   │   └── VciObd2Strategy.kt
│   └── factory/
│       └── Obd2Factory.kt
├── ===Need to research nws structure more===
├── nws/
│   ├── domain/
│   │   ├── model
│   │   └── service
│   ├── oem/
│   │   └── domain/
│   │       ├── model/
│   │       │   ├── Module.kt
│   │       │   ├── OemDtc.kt
│   │       │   ├── System.kt
│   │       │   ├── SubSytem.kt
│   │       │   ├── ScanningStatus.kt
│   │       │   ├── LinkingStatus.kt
│   │       │   └── OemEraseStatus.kt
│   │       ├── parser/
│   │       │   └── OemDtcParser.kt
│   │       └── service/
│   │           ├── OemService.kt
│   │           └── impl/
│   │               ├── GetListSystem.kt
│   │               ├── CheckSupport.kt
│   │               ├── ScanSystem.kt
│   │               ├── EraseSystem.kt
│   │               └── ...
│   ├── ofm/
│   │   └── domain/
│   │       └── model/
│   │           ├── ServiceCheck.kt
│   │           └── WarningLight.kt
│   ├── ld/
│   │   └── domain/
│   │       ├── model/
│   │       │   ├── NwsLiveDataItem.kt
│   │       │   └── NwsLiveDataPid.kt
│   │       └── service
│   ├── strategy/
│   │   ├── <<NwsStrategy>>.kt
│   │   ├── PassthruNwsStrategy.kt
│   │   └── VciNwsStrategy.kt
│   └── factory/
│       └── NwsFactory
├── vehicle/
│   └── domain/
│       ├── model/
│       │   ├── Vin.kt
│       │   ├── Ymme.kt
│       │   └── Odo.kt
│       └── service/
│           ├── VehicleService.kt
│           └── impl/
│               ├── GetVehiclesHistory.kt
│               ├── GetCurrentVehicleInfo.kt
│               └── ...
├── upgrade/
│   ├── domain/
│   │   ├── model/
│   │   │   ├── UpgradeType.kt
│   │   │   ├── FirmwareInfo.kt
│   │   │   └── BootloaderInfo.kt
│   │   └── service/
│   │       ├── UpgradeService.kt
│   │       └── impl/
│   │           ├── StartUpgrade.kt
│   │           └── Reboot.kt
│   ├── strategy/
│   │   ├── <<UpgradeStrategy>>.kt
│   │   ├── PassthruUpgradeStrategy.kt
│   │   ├── BatteryUpgradeStrategy.kt
│   │   └── VciUpgradeStrategy.kt
│   └── factory/
│       └── UpgradeFactory.kt
├── utils/
│   └── converter/
│       ├── Byte.kt
│       ├── Dec.kt
│       ├── Hex.kt
│       └── String.kt
├── coreManager.kt      #DO NOT handle logic here, DI only
└── ...
 ```

### Implement Diagram

```mermaid
flowchart TB
 subgraph Device["Device Module Structure"]
        DM["Model"]
        DS["Service"]
        DF["Factory"]
        Dev["Device Domain"]
  end
 subgraph Connection["Connection Module Structure"]
        CMo["Model"]
        CS["Service"]
        CF["Factory"]
        Conn["Connection Domain"]
  end
 subgraph Command["Command Module Structure"]
        CmdM["Model"]
        CmdH["Handler"]
        CmdF["Factory"]
        Cmd["Command Domain"]
  end
 subgraph Domains["Domain Modules"]
        Device
        Connection
        Command
  end
 subgraph Strategies["Strategy Implementations"]
        DevStr["Device Strategies"]
        ConnStr["Connection Strategies"]
        CmdStr["Command Strategies"]
        BS["BatteryStrategy"]
        PS["PassthruStrategy"]
        VS["VciStrategy"]
        BLE["BLEConnection"]
        SER["SerialConnection"]
        BCS["BatteryCmd"]
        PCS["PassthruCmd"]
        VCS["VciCmd"]
  end
    Dev --> DM & DS & DF
    Conn --> CMo & CS & CF
    Cmd --> CmdM & CmdH & CmdF
    DevStr -- Battery --> BS
    DevStr -- Passthru --> PS
    DevStr -- VCI --> VS
    ConnStr -- BLE --> BLE
    ConnStr -- Serial --> SER
    CmdStr -- Battery --> BCS
    CmdStr -- Passthru --> PCS
    CmdStr -- VCI --> VCS
    Device -. Uses .-> DevStr
    Connection -. Uses .-> ConnStr
    Command -. Uses .-> CmdStr

     DM:::domain
     DS:::domain
     DF:::domain
     Dev:::domain
     CMo:::domain
     CS:::domain
     CF:::domain
     Conn:::domain
     CmdM:::domain
     CmdH:::domain
     CmdF:::domain
     Cmd:::domain
     DevStr:::strategy
     ConnStr:::strategy
     CmdStr:::strategy
     BS:::strategy
     PS:::strategy
     VS:::strategy
     BLE:::strategy
     SER:::strategy
     BCS:::strategy
     PCS:::strategy
     VCS:::strategy
    classDef core fill:#ff9999,color:#000000,stroke:#ff6666
    classDef domain fill:#99ff99,color:#000000,stroke:#66ff66
    classDef strategy fill:#9999ff,color:#000000,stroke:#6666ff
    classDef utils fill:#ffff99,color:#000000,stroke:#ffff66
```

### Example Relationship of device module

```mermaid
flowchart LR
%% Styles
    classDef usecase fill:#e3f2fd,stroke:#1565c0,stroke-width:2px,color:#0d47a1,font-weight:bold;
    classDef model fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c;
    classDef module fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20;
    classDef factory fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#e65100;
    classDef strategy fill:#ffebee,stroke:#c62828,stroke-width:2px,color:#b71c1c;
    classDef actor fill:#eceff1,stroke:#455a64,stroke-width:2px,color:#263238,font-style:italic;

%% Nodes
    DeviceUseCases["DeviceUseCases Facade"]:::usecase
    DisconnectDeviceUseCase["DisconnectDevice"]:::usecase
    GetDeviceInfoUseCase["GetDeviceInfo"]:::usecase
    ScanForDevicesUseCase["ScanDevices"]:::usecase
    GetConnectedDeviceUseCase["GetConnectedDevice"]:::usecase

    ConnectionHandler["ConnectionHandler (from connection module)"]:::module
    CacheManager["CacheManager (from cache module)"]:::module
    CommandExecutor["CommandExecutor (from command module)"]:::module

    Device["Device Model"]:::model
    DeviceInfo["DeviceInfo Model"]:::model
    DeviceStatus["DeviceStatus Model"]:::model
    ConnectionState["ConnectionState Enum"]:::model

    DeviceFactory["DeviceFactory"]:::factory

    DeviceStrategy["DeviceStrategy Interface"]:::strategy
    BatteryDeviceStrategy["BatteryDeviceStrategy"]:::strategy
    PassthruDeviceStrategy["PassthruDeviceStrategy"]:::strategy
    VciDeviceStrategy["VciDeviceStrategy"]:::strategy

    Actor((("App Client"))):::actor

%% Connections
    DeviceUseCases --> DisconnectDeviceUseCase & GetDeviceInfoUseCase & ScanForDevicesUseCase
    GetConnectedDeviceUseCase --> ConnectionHandler & CacheManager
    DisconnectDeviceUseCase --> ConnectionHandler & Device
    GetDeviceInfoUseCase --> CommandExecutor & Device & DeviceInfo & CacheManager
    ScanForDevicesUseCase --> ConnectionHandler & Device

    DeviceFactory --> DeviceStrategy & BatteryDeviceStrategy & PassthruDeviceStrategy & VciDeviceStrategy & Device

    BatteryDeviceStrategy -. implements .-> DeviceStrategy
    PassthruDeviceStrategy -. implements .-> DeviceStrategy
    VciDeviceStrategy -. implements .-> DeviceStrategy

    BatteryDeviceStrategy --> Device
    PassthruDeviceStrategy --> Device
    VciDeviceStrategy --> Device

    Device --> ConnectionState & DeviceInfo & DeviceStatus

    Actor -- "Call this to use" --> DeviceUseCases
    Actor -- "Use this to init" --> DeviceFactory

%% Layout hints
    subgraph UseCases ["Use Cases"]
        direction TB
        DeviceUseCases
        DisconnectDeviceUseCase
        GetDeviceInfoUseCase
        ScanForDevicesUseCase
        GetConnectedDeviceUseCase
    end

    subgraph Modules ["External Modules"]
        direction TB
        ConnectionHandler
        CacheManager
        CommandExecutor
    end

    subgraph Models ["Data Models"]
        direction TB
        Device
        DeviceInfo
        DeviceStatus
        ConnectionState
    end

    subgraph Factory ["Factory & Strategies"]
        direction TB
        DeviceFactory
        DeviceStrategy
        BatteryDeviceStrategy
        PassthruDeviceStrategy
        VciDeviceStrategy
    end

    style UseCases fill:#bbdefb,stroke:#1565c0,stroke-dasharray: 5 5
    style Modules fill:#c8e6c9,stroke:#2e7d32,stroke-dasharray: 5 5
    style Models fill:#e1bee7,stroke:#7b1fa2,stroke-dasharray: 5 5
    style Factory fill:#ffcc80,stroke:#f57c00,stroke-dasharray: 5 5
```

## 2. Reconsider external database

### **Security:**

- The implement of internal databases may have difficulties and not realistic necessarily. When client have the sdk aar file, they can just change the file to .jar and extract it like a normal zip file. So the internal database may not be secure enough. 
- More over, the database service can not use .db file directly, it need to copy the file to local storage first, which may cause performance issue and go against the purpose of internal db.

### 
