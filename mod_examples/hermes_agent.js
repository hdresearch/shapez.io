// @ts-nocheck
/**
 * Hermes Agent Mod for shapez.io
 * 
 * Transforms shapez.io into a visual AI agent interface:
 * - Circles (painted) = iMessage tasks (local agent)
 * - Squares (painted) = GitHub Admin tasks (Apple Container)
 * - Stars (painted) = Cloud Code tasks (Vers VM)
 * 
 * Colors determine the AI provider:
 * - Green = Gemini
 * - Red = Claude/Anthropic
 * - Blue = Future provider
 */

const METADATA = {
    website: "https://github.com/hdresearch/hermes-agent",
    author: "HDR",
    name: "Hermes Agent",
    version: "3.0.0",
    id: "hermes-agent",
    description: "Transform shapez.io into a visual AI orchestration interface. Configure prompts and route tasks to different execution environments.",
    minimumGameVersion: ">=1.5.0",
    doesNotAffectSavegame: true,
};

// ============================================================================
// SHAPE TYPE TO TASK TYPE MAPPING
// ============================================================================

// Shape order around hub (clockwise from top):
// Square (rect) -> Red -> Circle -> Blue -> Star -> Green
// 
// Level progression:
// 1. Square = Browser Automation (Vers VM with Playwright)
// 2. Circle = iMessage Task (Local agent with AppleScript)
// 3. Star = GitHub Admin (Apple Container with GITHUB_API_KEY)
// 4. Yellow (mixed) = Cloud Code (Vers VM with pi agent)

const SHAPE_TASK_TYPES = {
    rect: {
        name: "Browser Automation",
        icon: "🌐", 
        description: "Runs in a Vers VM with Playwright. Can navigate pages, click, fill forms, screenshot, and extract content",
        backend: "vers",
        promptLabel: "Browser Task (Playwright)",
        promptPlaceholder: "e.g., Go to news.ycombinator.com and get the top 5 headlines..."
    },
    circle: {
        name: "iMessage Task",
        icon: "💬",
        description: "Local agent with iMessage read tools via AppleScript (read-only for now)",
        backend: "local",
        promptLabel: "iMessage Task (Read-Only)",
        promptPlaceholder: "e.g., Read my latest messages from Mom..."
    },
    star: {
        name: "GitHub Admin Task", 
        icon: "🐙",
        description: "Apple Container with GITHUB_API_KEY for managing issues, PRs, and repos",
        backend: "apple_container",
        promptLabel: "GitHub Admin Task",
        promptPlaceholder: "e.g., List open issues in hdresearch/hermes-agent..."
    },
    windmill: {
        name: "Custom Task",
        icon: "⚙️",
        description: "Custom task type (configure in Hermes)",
        backend: "docker",
        promptLabel: "Custom Task",
        promptPlaceholder: "Enter your task..."
    }
};

// ============================================================================
// COLOR TO PROVIDER/MODE MAPPING
// ============================================================================

const COLOR_MODES = {
    green: {
        name: "Gemini",
        icon: "💚",
        description: "Google's Gemini AI",
        provider: "gemini"
    },
    red: {
        name: "Claude",
        icon: "❤️",
        description: "Anthropic's Claude AI",
        provider: "anthropic"
    },
    yellow: {
        name: "Cloud Code",
        icon: "☁️",
        description: "Vers VM with coding agent (pi)",
        provider: "cloud_code"
    }
    // Note: Blue is intentionally not supported - use Green, Red, or Yellow
};

// ============================================================================
// HERMES BUILDING DESCRIPTIONS
// ============================================================================

const HERMES_BUILDINGS = {
    miner: {
        name: "Task Source",
        description: "🎯 <strong>Double-click to configure a task.</strong><br><br>Place on different shape patches for different task types:<br>• <strong>⬛ Squares</strong> → Browser Automation (Vers VM + Playwright)<br>• <strong>⚪ Circles</strong> → iMessage tasks (local agent)<br>• <strong>⭐ Stars</strong> → GitHub Admin (Apple Container)<br><br>Paint with colors to select execution mode, then deliver to Hub."
    },
    belt: {
        name: "Task Pipeline",
        description: "📡 <strong>Transports tasks to the Hub.</strong><br><br>Connect task sources to the Hub. Shapes represent queued tasks waiting to be dispatched to their execution environments."
    },
    hub: {
        name: "Task Dispatcher",
        description: "🧠 <strong>Dispatches tasks to execution environments.</strong><br><br>When painted shapes arrive:<br>• 🌐 <strong>Squares</strong> → Web Browser Agent (Vers VM + Playwright)<br>• 💬 <strong>Circles</strong> → iMessage Agent (local + AppleScript)<br>• 🐙 <strong>Stars</strong> → GitHub Admin (Apple Container)<br>• ☁️ <strong>Yellow</strong> → Cloud Code (Vers VM + pi)<br><br>⚠️ <strong>Grey/uncolored shapes will be rejected!</strong>"
    },
    balancer: {
        name: "Load Balancer",
        description: "⚖️ <strong>Distributes requests across multiple AI providers.</strong><br><br>Use to split traffic between Gemini and Claude, or to merge multiple prompt streams into one pipeline."
    },
    underground_belt: {
        name: "Secure Tunnel",
        description: "🔒 <strong>Hidden data channel.</strong><br><br>Routes AI requests underground to bypass obstacles. Useful for complex factory layouts where you need requests to cross other pipelines."
    },
    cutter: {
        name: "Prompt Splitter",
        description: "✂️ <strong>Splits prompts for parallel processing.</strong><br><br>Takes one request and creates two copies - useful for sending the same prompt to both Gemini and Claude simultaneously."
    },
    rotater: {
        name: "Context Rotator",
        description: "🔄 <strong>Transforms request context.</strong><br><br>Rotates the shape representation - in Hermes terms, this can modify how context is passed between AI calls."
    },
    stacker: {
        name: "Context Combiner",
        description: "📚 <strong>Combines multiple contexts.</strong><br><br>Stacks two shapes together - use this to merge outputs from multiple AI calls into a combined context for downstream processing."
    },
    mixer: {
        name: "Color Mixer",
        description: "🎨 <strong>Combines colors to create new modes!</strong><br><br>Mix colors to unlock special modes:<br>• <span style='color:#78ff66'>Green</span> + <span style='color:#ff666a'>Red</span> = <span style='color:#fcf52a'>Yellow</span> (Cloud Code)<br><br>Yellow mode spawns a Vers VM with pi installed for full coding agent capabilities!"
    },
    painter: {
        name: "AI Provider Selector",
        description: "🖌️ <strong>Assigns AI provider to tasks.</strong><br><br>Paint shapes with colors:<br>• <span style='color:#78ff66'>Green</span> → Gemini AI<br>• <span style='color:#ff666a'>Red</span> → Claude AI<br>• <span style='color:#fcf52a'>Yellow</span> → Cloud Code (mix green+red!)"
    },
    trash: {
        name: "Request Canceller",
        description: "🗑️ <strong>Discards unwanted requests.</strong><br><br>Drops shapes into the void. Use to filter out requests you don't want to send to the AI."
    },
    storage: {
        name: "Request Buffer",
        description: "📦 <strong>Queues requests for batch processing.</strong><br><br>Stores shapes until needed. Useful for rate-limiting AI calls or batching multiple prompts together."
    },
    filter: {
        name: "Request Router",
        description: "🔀 <strong>Routes requests by shape/color.</strong><br><br>Sends matching shapes one direction, others another way. Use to separate Gemini vs Claude requests in your pipeline."
    },
    display: {
        name: "Response Display",
        description: "📺 <strong>Shows AI response status.</strong><br><br>Displays the current shape/color being processed. Wire it up to visualize which AI provider is handling requests."
    },
    lever: {
        name: "Manual Trigger",
        description: "🎚️ <strong>Manually control AI request flow.</strong><br><br>Toggle on/off to start or pause sending requests to the AI. Useful for testing prompts before enabling continuous flow."
    },
    wire: {
        name: "Signal Wire",
        description: "⚡ <strong>Carries control signals.</strong><br><br>Wires connect logic components. Use them to create conditional flows - e.g., only send to Claude if Gemini is busy."
    },
    constant_signal: {
        name: "Constant Config",
        description: "📌 <strong>Provides fixed configuration values.</strong><br><br>Outputs a constant signal. Use to set static parameters like temperature, max tokens, or provider preferences."
    },
    logic_gate: {
        name: "Logic Controller",
        description: "🔲 <strong>Conditional AI routing.</strong><br><br>AND, OR, XOR, NOT gates for complex logic. Example: Only call Claude AND Gemini if both are available."
    },
    virtual_processor: {
        name: "Signal Processor",
        description: "🔧 <strong>Transforms control signals.</strong><br><br>Performs operations on wired values. Use to compute routing decisions based on response quality or latency."
    },
    reader: {
        name: "Response Reader",
        description: "📖 <strong>Reads shape data as signals.</strong><br><br>Converts belt items to wire signals. Use to check what type of request is passing through and route accordingly."
    },
    comparator: {
        name: "Response Comparator",
        description: "⚖️ <strong>Compares two signals.</strong><br><br>Outputs true if conditions match. Use to compare Gemini vs Claude response quality scores."
    },
    transistor: {
        name: "Flow Gate",
        description: "🚦 <strong>Signal-controlled belt gate.</strong><br><br>Passes items only when wire signal is true. Use to pause AI requests based on conditions."
    },
    analyzer: {
        name: "Request Analyzer",
        description: "🔬 <strong>Inspects request properties.</strong><br><br>Outputs the shape/color of items. Use to log or debug what requests are flowing through your pipeline."
    },
    item_producer: {
        name: "Test Request Generator",
        description: "🏭 <strong>Generates test requests.</strong><br><br>Produces shapes on demand. Use for testing your AI pipeline without configuring real prompts."
    },
    goal_acceptor: {
        name: "Goal Validator",
        description: "🎯 <strong>Validates pipeline output.</strong><br><br>Checks if delivered shapes match a goal. Use to verify your AI routing logic is working correctly."
    },
    block: {
        name: "Pipeline Block",
        description: "🧱 <strong>Structural element.</strong><br><br>A solid block for organizing your factory layout. Use to create visual separation between different AI processing stages."
    },
    constant_producer: {
        name: "Infinite Source",
        description: "♾️ <strong>Unlimited request source.</strong><br><br>Continuously produces shapes. Use for stress-testing your AI pipeline with constant requests."
    },
    wire_tunnel: {
        name: "Signal Tunnel",
        description: "🚇 <strong>Underground signal routing.</strong><br><br>Routes wire signals under obstacles. Use for complex logic layouts where wires need to cross."
    }
};

class Mod extends shapez.Mod {
    init() {
        console.log("[Hermes] Mod initializing...");
        
        // ====================================================================
        // OVERRIDE TUTORIAL HINTS FOR HERMES AGENT
        // ====================================================================
        
        this.modInterface.registerTranslations("en", {
            ingame: {
                interactiveTutorial: {
                    title: "Hermes Agent Tutorial",
                    hints: {
                        // Level 1: Web Browser Agent (Square + Red)
                        "1_1_extractor": "🌐 <strong>Web Browser Agent</strong><br><br>Place a <strong>Task Source</strong> (miner) on the <strong>Square</strong> patch.<br><br>This connects to a Vers VM with Playwright for browser automation.",
                        "1_2_conveyor": "Connect the Task Source to the <strong>Hub</strong> using a <strong>Pipeline</strong> (belt)!<br><br>💡 <strong>Double-click</strong> the Task Source to set your browser instruction.",
                        "1_3_expand": "⚠️ Grey shapes won't work! You need to <strong>paint them with a color</strong>.<br><br>Connect your pipeline to the <strong>Red</strong> color patch, then through a <strong>Painter</strong> to color your squares red.<br><br>🔴 Red = Claude AI (Anthropic)",
                    },
                },
            },
            // Custom level descriptions for Hermes
            storyRewards: {
                // Level 1 complete: Browser automation works
                reward_cutter_and_trash: {
                    title: "✅ Level 1: Web Browser Agent",
                    desc: "Excellent! You've set up a web browsing agent. Red squares spawn Vers VMs with Playwright installed. Claude helps navigate and automate browser tasks.",
                },
                // Level 2: iMessage (Circle + Red) 
                reward_rotater: {
                    title: "📱 Level 2: iMessage Agent", 
                    desc: "Now connect <strong>Circles</strong> to the <strong>Red</strong> painter!<br><br>Circles spawn local agents with iMessage read tools. Double-click to set an instruction like 'Read my latest messages'.",
                },
                // Level 3: GitHub Admin (Star + Red)
                reward_painter: {
                    title: "🐙 Level 3: GitHub Admin Agent",
                    desc: "Connect <strong>Stars</strong> to the <strong>Red</strong> painter!<br><br>Stars spawn Apple Containers with GITHUB_API_KEY. Set instructions like 'List open issues in hdresearch/hermes-agent'.",
                },
                // Level 4: Cloud Code (any shape + Yellow)
                reward_mixer: {
                    title: "☁️ Level 4: Cloud Code Agent",
                    desc: "Use the <strong>Color Mixer</strong> to combine Green + Red = <strong>Yellow</strong>!<br><br>Yellow shapes spawn Vers VMs with pi (coding agent). Full cloud-based development environment!",
                },
            },
        });
        
        // ====================================================================
        // OVERRIDE LEVEL DEFINITIONS FOR HERMES
        // ====================================================================
        
        // Custom Hermes levels - each requires only 1 shape
        const hermesLevels = [
            // Level 1: Red Square (Browser Automation)
            {
                shape: "RrRrRrRr",  // Red square
                required: 1,
                reward: shapez.enumHubGoalRewards.reward_cutter_and_trash,
            },
            // Level 2: Red Circle (iMessage)
            {
                shape: "CrCrCrCr",  // Red circle
                required: 1,
                reward: shapez.enumHubGoalRewards.reward_rotater,
            },
            // Level 3: Red Star (GitHub Admin)
            {
                shape: "SrSrSrSr",  // Red star
                required: 1,
                reward: shapez.enumHubGoalRewards.reward_painter,
            },
            // Level 4: Yellow shape (Cloud Code) - any shape painted yellow
            {
                shape: "RyRyRyRy",  // Yellow square (green + red mixed)
                required: 1,
                reward: shapez.enumHubGoalRewards.reward_mixer,
            },
            // Freeplay - any shape
            {
                shape: "CuCuCuCu",
                required: 1,
                reward: shapez.enumHubGoalRewards.reward_freeplay,
            },
        ];
        
        // Store levels for use in game mode override
        this.hermesLevels = hermesLevels;
        const modRef = this;
        
        // Override the RegularGameMode to use our custom levels
        if (shapez.RegularGameMode) {
            this.modInterface.replaceMethod(shapez.RegularGameMode, "getLevelDefinitions", function() {
                console.log("[Hermes] Using custom Hermes levels");
                return modRef.hermesLevels;
            });
        }
        
        // ====================================================================
        // HIDE SECONDARY TOOLBAR (Storage, Belt reader, Switch, Filter, Display)
        // ====================================================================
        
        // Clear secondary buildings before the toolbar initializes
        if (shapez.HUDBuildingsToolbar) {
            this.modInterface.runAfterMethod(shapez.HUDBuildingsToolbar, "initialize", function() {
                // Hide the secondary row if it was created
                if (this.secondaryDomAttach) {
                    this.secondaryDomAttach.element.style.display = "none";
                }
                console.log("[Hermes] Hidden secondary toolbar");
            });
        }
        
        // Store prompts per entity (by entity uid)
        this.entityPrompts = {};
        
        // Legacy provider-based prompts (for painted shapes)
        this.prompts = {
            gemini: "",
            anthropic: ""
        };
        
        // Response queue for display
        this.responseQueue = [];
        
        // WebSocket connection to Hermes
        this.ws = null;
        this.wsConnected = false;
        this.pendingRequests = [];
        
        // Don't connect here - wait for game init
        
        const mod = this;
        
        // ====================================================================
        // OVERRIDE ALL BUILDING NAMES AND DESCRIPTIONS
        // ====================================================================
        
        // Miner
        this.modInterface.replaceMethod(shapez.MetaMinerBuilding, "getName", function() {
            return HERMES_BUILDINGS.miner.name;
        });
        this.modInterface.replaceMethod(shapez.MetaMinerBuilding, "getDescription", function() {
            return HERMES_BUILDINGS.miner.description;
        });
        
        // Belt
        this.modInterface.replaceMethod(shapez.MetaBeltBuilding, "getName", function() {
            return HERMES_BUILDINGS.belt.name;
        });
        this.modInterface.replaceMethod(shapez.MetaBeltBuilding, "getDescription", function() {
            return HERMES_BUILDINGS.belt.description;
        });
        
        // Hub
        this.modInterface.replaceMethod(shapez.MetaHubBuilding, "getName", function() {
            return HERMES_BUILDINGS.hub.name;
        });
        this.modInterface.replaceMethod(shapez.MetaHubBuilding, "getDescription", function() {
            return HERMES_BUILDINGS.hub.description;
        });
        
        // Balancer
        if (shapez.MetaBalancerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaBalancerBuilding, "getName", function() {
                return HERMES_BUILDINGS.balancer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaBalancerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.balancer.description;
            });
        }
        
        // Underground Belt
        if (shapez.MetaUndergroundBeltBuilding) {
            this.modInterface.replaceMethod(shapez.MetaUndergroundBeltBuilding, "getName", function() {
                return HERMES_BUILDINGS.underground_belt.name;
            });
            this.modInterface.replaceMethod(shapez.MetaUndergroundBeltBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.underground_belt.description;
            });
        }
        
        // Cutter
        if (shapez.MetaCutterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaCutterBuilding, "getName", function() {
                return HERMES_BUILDINGS.cutter.name;
            });
            this.modInterface.replaceMethod(shapez.MetaCutterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.cutter.description;
            });
        }
        
        // Rotater
        if (shapez.MetaRotaterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaRotaterBuilding, "getName", function() {
                return HERMES_BUILDINGS.rotater.name;
            });
            this.modInterface.replaceMethod(shapez.MetaRotaterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.rotater.description;
            });
        }
        
        // Stacker
        if (shapez.MetaStackerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaStackerBuilding, "getName", function() {
                return HERMES_BUILDINGS.stacker.name;
            });
            this.modInterface.replaceMethod(shapez.MetaStackerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.stacker.description;
            });
        }
        
        // Mixer
        if (shapez.MetaMixerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaMixerBuilding, "getName", function() {
                return HERMES_BUILDINGS.mixer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaMixerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.mixer.description;
            });
        }
        
        // Painter
        if (shapez.MetaPainterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaPainterBuilding, "getName", function() {
                return HERMES_BUILDINGS.painter.name;
            });
            this.modInterface.replaceMethod(shapez.MetaPainterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.painter.description;
            });
        }
        
        // Trash
        if (shapez.MetaTrashBuilding) {
            this.modInterface.replaceMethod(shapez.MetaTrashBuilding, "getName", function() {
                return HERMES_BUILDINGS.trash.name;
            });
            this.modInterface.replaceMethod(shapez.MetaTrashBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.trash.description;
            });
        }
        
        // Storage
        if (shapez.MetaStorageBuilding) {
            this.modInterface.replaceMethod(shapez.MetaStorageBuilding, "getName", function() {
                return HERMES_BUILDINGS.storage.name;
            });
            this.modInterface.replaceMethod(shapez.MetaStorageBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.storage.description;
            });
        }
        
        // Filter
        if (shapez.MetaFilterBuilding) {
            this.modInterface.replaceMethod(shapez.MetaFilterBuilding, "getName", function() {
                return HERMES_BUILDINGS.filter.name;
            });
            this.modInterface.replaceMethod(shapez.MetaFilterBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.filter.description;
            });
        }
        
        // Display
        if (shapez.MetaDisplayBuilding) {
            this.modInterface.replaceMethod(shapez.MetaDisplayBuilding, "getName", function() {
                return HERMES_BUILDINGS.display.name;
            });
            this.modInterface.replaceMethod(shapez.MetaDisplayBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.display.description;
            });
        }
        
        // Lever
        if (shapez.MetaLeverBuilding) {
            this.modInterface.replaceMethod(shapez.MetaLeverBuilding, "getName", function() {
                return HERMES_BUILDINGS.lever.name;
            });
            this.modInterface.replaceMethod(shapez.MetaLeverBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.lever.description;
            });
        }
        
        // Wire
        if (shapez.MetaWireBuilding) {
            this.modInterface.replaceMethod(shapez.MetaWireBuilding, "getName", function() {
                return HERMES_BUILDINGS.wire.name;
            });
            this.modInterface.replaceMethod(shapez.MetaWireBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.wire.description;
            });
        }
        
        // Constant Signal
        if (shapez.MetaConstantSignalBuilding) {
            this.modInterface.replaceMethod(shapez.MetaConstantSignalBuilding, "getName", function() {
                return HERMES_BUILDINGS.constant_signal.name;
            });
            this.modInterface.replaceMethod(shapez.MetaConstantSignalBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.constant_signal.description;
            });
        }
        
        // Logic Gate
        if (shapez.MetaLogicGateBuilding) {
            this.modInterface.replaceMethod(shapez.MetaLogicGateBuilding, "getName", function() {
                return HERMES_BUILDINGS.logic_gate.name;
            });
            this.modInterface.replaceMethod(shapez.MetaLogicGateBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.logic_gate.description;
            });
        }
        
        // Virtual Processor
        if (shapez.MetaVirtualProcessorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaVirtualProcessorBuilding, "getName", function() {
                return HERMES_BUILDINGS.virtual_processor.name;
            });
            this.modInterface.replaceMethod(shapez.MetaVirtualProcessorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.virtual_processor.description;
            });
        }
        
        // Reader
        if (shapez.MetaReaderBuilding) {
            this.modInterface.replaceMethod(shapez.MetaReaderBuilding, "getName", function() {
                return HERMES_BUILDINGS.reader.name;
            });
            this.modInterface.replaceMethod(shapez.MetaReaderBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.reader.description;
            });
        }
        
        // Comparator
        if (shapez.MetaComparatorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaComparatorBuilding, "getName", function() {
                return HERMES_BUILDINGS.comparator.name;
            });
            this.modInterface.replaceMethod(shapez.MetaComparatorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.comparator.description;
            });
        }
        
        // Transistor
        if (shapez.MetaTransistorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaTransistorBuilding, "getName", function() {
                return HERMES_BUILDINGS.transistor.name;
            });
            this.modInterface.replaceMethod(shapez.MetaTransistorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.transistor.description;
            });
        }
        
        // Analyzer
        if (shapez.MetaAnalyzerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaAnalyzerBuilding, "getName", function() {
                return HERMES_BUILDINGS.analyzer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaAnalyzerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.analyzer.description;
            });
        }
        
        // Item Producer
        if (shapez.MetaItemProducerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaItemProducerBuilding, "getName", function() {
                return HERMES_BUILDINGS.item_producer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaItemProducerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.item_producer.description;
            });
        }
        
        // Goal Acceptor
        if (shapez.MetaGoalAcceptorBuilding) {
            this.modInterface.replaceMethod(shapez.MetaGoalAcceptorBuilding, "getName", function() {
                return HERMES_BUILDINGS.goal_acceptor.name;
            });
            this.modInterface.replaceMethod(shapez.MetaGoalAcceptorBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.goal_acceptor.description;
            });
        }
        
        // Block
        if (shapez.MetaBlockBuilding) {
            this.modInterface.replaceMethod(shapez.MetaBlockBuilding, "getName", function() {
                return HERMES_BUILDINGS.block.name;
            });
            this.modInterface.replaceMethod(shapez.MetaBlockBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.block.description;
            });
        }
        
        // Constant Producer
        if (shapez.MetaConstantProducerBuilding) {
            this.modInterface.replaceMethod(shapez.MetaConstantProducerBuilding, "getName", function() {
                return HERMES_BUILDINGS.constant_producer.name;
            });
            this.modInterface.replaceMethod(shapez.MetaConstantProducerBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.constant_producer.description;
            });
        }
        
        // Wire Tunnel
        if (shapez.MetaWireTunnelBuilding) {
            this.modInterface.replaceMethod(shapez.MetaWireTunnelBuilding, "getName", function() {
                return HERMES_BUILDINGS.wire_tunnel.name;
            });
            this.modInterface.replaceMethod(shapez.MetaWireTunnelBuilding, "getDescription", function() {
                return HERMES_BUILDINGS.wire_tunnel.description;
            });
        }
        
        // ====================================================================
        // INTERCEPT HUB DELIVERY TO TRIGGER AI
        // ====================================================================
        
        // Use runAfterMethod to add AI logic after the original hub processing
        this.modInterface.runAfterMethod(
            shapez.ItemProcessorSystem,
            "process_HUB", 
            function(payload) {
                // Original method already ran - now add our AI logic
                for (let i = 0; i < payload.inputCount; ++i) {
                    const item = payload.items.get(i);
                    if (!item) continue;
                    
                    // Check if it's a shape item
                    if (item.getItemType && item.getItemType() === "shape") {
                        const definition = item.definition;
                        const layers = definition.layers;
                        
                        if (layers && layers.length > 0) {
                            const firstLayer = layers[0];
                            const firstQuad = firstLayer[0];
                            
                            if (firstQuad) {
                                const color = firstQuad.color;
                                const shapeType = firstQuad.subShape; // "circle", "rect", "star", "windmill"
                                
                                // Get task type info based on shape
                                const taskInfo = SHAPE_TASK_TYPES[shapeType] || SHAPE_TASK_TYPES.windmill;
                                
                                // Check if shape is colored (painted)
                                if (color === "uncolored" || !color) {
                                    // Show yellow warning for uncolored shapes
                                    mod.showResponse(
                                        `⚠️ ${taskInfo.icon} ${taskInfo.name} needs a color! Paint it first.`,
                                        "warning"
                                    );
                                    continue;
                                }
                                
                                // Get color mode info
                                const colorMode = COLOR_MODES[color];
                                
                                // Check if this color is supported
                                if (!colorMode) {
                                    mod.showResponse(
                                        `⚠️ Color "${color}" not configured. Use blue, green, red, or yellow.`,
                                        "warning"
                                    );
                                    continue;
                                }
                                
                                // Find prompt for this shape type
                                let prompt = null;
                                
                                // Check entity-specific prompts (from double-clicked miners)
                                for (const entityId in mod.entityPrompts) {
                                    const entityPrompt = mod.entityPrompts[entityId];
                                    if (entityPrompt && entityPrompt.prompt) {
                                        // Check if this prompt matches the shape type
                                        if (!entityPrompt.shapeType || entityPrompt.shapeType === shapeType) {
                                            prompt = entityPrompt.prompt;
                                            break;
                                        }
                                    } else if (typeof entityPrompt === "string" && entityPrompt) {
                                        prompt = entityPrompt;
                                        break;
                                    }
                                }
                                
                                if (prompt) {
                                    // Send task with shape type and color mode info
                                    mod.sendTask(colorMode.provider, shapeType, prompt, taskInfo, colorMode);
                                } else {
                                    mod.showResponse(
                                        `⚠️ No prompt set for ${taskInfo.name}. Double-click a source to configure.`,
                                        "warning"
                                    );
                                }
                            }
                        }
                    }
                }
            }
        );
        
        // ====================================================================
        // CUSTOM MAP GENERATION - HERMES STARTING LAYOUT
        // ====================================================================
        
        // Override the predefined map generation to create a Hermes-friendly layout
        // Arranged in a circle around the hub: Square, Red, Circle, Blue, Star, Green
        // This creates natural pairings: Square+Red, Circle+Blue, Star+Green
        this.modInterface.replaceMethod(shapez.MapChunk, "generatePredefined", function($original, [rng]) {
            // Chunk coordinates
            const x = this.x;
            const y = this.y;
            
            // Get shape items helper
            const getShape = (shortKey) => this.root.shapeDefinitionMgr.getShapeItemFromShortKey(shortKey);
            
            // Get color items via shapez global
            const getColor = (colorName) => shapez.COLOR_ITEM_SINGLETONS[colorName];
            
            // Arranged clockwise around the hub starting from top:
            // 
            //          (0,-1)         (1,-1)
            //        SQUARE          RED
            //
            //  (-1,0)        [HUB]         (1,0)
            //  GREEN                      CIRCLE
            //
            //         (-1,1)          (0,1)
            //          STAR           BLUE
            //
            
            // Top center (0, -1): Squares (rectangles)
            if (x === 0 && y === -1) {
                this.internalGeneratePatch(rng, 2, getShape("RuRuRuRu"), 7, 12);
                return true;
            }
            
            // Top right (1, -1): Red color
            if (x === 1 && y === -1) {
                this.internalGeneratePatch(rng, 2, getColor("red"), 3, 12);
                return true;
            }
            
            // Right (1, 0): Circles
            if (x === 1 && y === 0) {
                this.internalGeneratePatch(rng, 2, getShape("CuCuCuCu"), 3, 7);
                return true;
            }
            
            // Bottom right (0, 1): Blue color
            if (x === 0 && y === 1) {
                this.internalGeneratePatch(rng, 2, getColor("blue"), 7, 3);
                return true;
            }
            
            // Bottom left (-1, 1): Stars
            if (x === -1 && y === 1) {
                this.internalGeneratePatch(rng, 2, getShape("SuSuSuSu"), 12, 3);
                return true;
            }
            
            // Left (-1, 0): Green color
            if (x === -1 && y === 0) {
                this.internalGeneratePatch(rng, 2, getColor("green"), 12, 7);
                return true;
            }
            
            // Hub chunk (0, 0) - no additional patches needed
            if (x === 0 && y === 0) {
                return true;
            }
            
            // For all other chunks, use original behavior
            return $original(rng);
        });
        
        // ====================================================================
        // GAME INITIALIZATION HOOKS
        // ====================================================================
        
        this.signals.gameInitialized.add(root => {
            mod.root = root;
            console.log("[Hermes] Game initialized, setting up event handlers");
            
            // Create the prompt dialog UI (must be done when DOM is ready)
            this.createPromptDialog();
            
            // Add double-click handler directly to the game canvas
            if (root.canvas) {
                console.log("[Hermes] Attaching dblclick handler to canvas");
                root.canvas.addEventListener("dblclick", (e) => {
                    console.log("[Hermes] Canvas double-click detected at", e.clientX, e.clientY);
                    mod.handleDoubleClick(e, root);
                });
            } else {
                console.warn("[Hermes] Canvas not found, using document fallback");
                document.addEventListener("dblclick", (e) => {
                    mod.handleDoubleClick(e, root);
                });
            }
            
            // Hook into game tick for response display updates
            root.signals.gameFrameStarted.add(() => {
                mod.updateResponses();
            });
            
            // Connect to WebSocket when game starts
            console.log("[Hermes] Game ready, connecting WebSocket...");
            mod.connectWebSocket();
            
            // Show initial message immediately
            mod.showResponse("🤖 Hermes Agent loading...", "loading");
        });
        
        console.log("[Hermes] Mod initialized successfully");
    }
    
    // ========================================================================
    // WEBSOCKET CONNECTION
    // ========================================================================
    
    connectWebSocket() {
        const mod = this;
        
        // Don't create multiple connections
        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            console.log("[Hermes] WebSocket already connecting/connected, skipping. State:", this.ws.readyState);
            return;
        }
        
        console.log("[Hermes] Creating new WebSocket connection to ws://localhost:8765...");
        
        try {
            this.ws = new WebSocket("ws://localhost:8765");
            console.log("[Hermes] WebSocket object created, readyState:", this.ws.readyState);
            
            this.ws.onopen = function(event) {
                console.log("[Hermes] WebSocket OPEN!", event);
                mod.wsConnected = true;
                mod.showResponse("🔗 Connected to Hermes Agent", "success");
                // Process any requests that were queued while connecting
                mod.processPendingRequests();
            };
            
            this.ws.onmessage = function(event) {
                console.log("[Hermes] WebSocket message received:", event.data.substring(0, 100));
                try {
                    const data = JSON.parse(event.data);
                    mod.handleWebSocketMessage(data);
                } catch (e) {
                    console.error("[Hermes] Failed to parse message:", e);
                }
            };
            
            this.ws.onclose = function(event) {
                console.log("[Hermes] WebSocket CLOSED! Code:", event.code, "Reason:", event.reason, "Clean:", event.wasClean);
                mod.wsConnected = false;
                mod.ws = null;
                setTimeout(function() { mod.connectWebSocket(); }, 5000);
            };
            
            this.ws.onerror = function(error) {
                console.error("[Hermes] WebSocket ERROR:", error);
                mod.wsConnected = false;
            };
        } catch (e) {
            console.error("[Hermes] Failed to create WebSocket:", e);
            this.ws = null;
            setTimeout(function() { mod.connectWebSocket(); }, 5000);
        }
    }
    
    handleWebSocketMessage(data) {
        if (data.type === "ai_response" || data.type === "task_response") {
            const provider = data.provider || "AI";
            const taskType = data.task_type || "";
            const response = data.response || data.result || "No response";
            
            // Get icon based on task type or provider
            let icon = "🤖";
            if (data.task_type) {
                const taskInfo = SHAPE_TASK_TYPES[data.task_type];
                if (taskInfo) icon = taskInfo.icon;
            } else {
                icon = provider === "gemini" ? "💚" : "❤️";
            }
            
            this.showResponse(icon + " " + (taskType || provider).toUpperCase() + ": " + response, "ai");
        } else if (data.type === "task_started") {
            const taskInfo = SHAPE_TASK_TYPES[data.task_type] || {};
            this.showResponse(`🚀 ${taskInfo.icon || "⚙️"} ${data.task_type} task started on ${data.backend}...`, "loading");
        } else if (data.type === "error") {
            this.showResponse("❌ Error: " + data.message, "error");
        }
    }
    
    // ========================================================================
    // TASK HANDLING (Shape-specific)
    // ========================================================================
    
    sendTask(provider, shapeType, prompt, taskInfo, colorMode) {
        console.log("[Hermes] sendTask called:", provider, shapeType, prompt, taskInfo, colorMode);
        
        // Check WebSocket state
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.showResponse("⚠️ Not connected to Hermes", "warning");
            this.connectWebSocket();
            return;
        }
        
        const taskIcon = taskInfo.icon || "⚙️";
        const colorIcon = colorMode?.icon || "🔵";
        this.showResponse(`${colorIcon} ${taskIcon} ${colorMode?.name || provider}: ${taskInfo.name}...`, "loading");
        
        const message = JSON.stringify({
            type: "task_request",
            request_id: Date.now().toString(),
            provider: provider,
            color_mode: colorMode?.name || provider,
            task_type: shapeType,
            backend: taskInfo.backend,
            prompt: prompt
        });
        
        console.log("[Hermes] Sending task message:", message);
        
        try {
            this.ws.send(message);
            console.log("[Hermes] Task message sent successfully");
        } catch (e) {
            console.error("[Hermes] Failed to send task:", e);
            this.showResponse("❌ Failed to send task: " + e.message, "error");
        }
    }
    
    // ========================================================================
    // AI REQUEST HANDLING (Legacy, for simple prompts)
    // ========================================================================
    
    sendToAI(provider, prompt) {
        console.log("[Hermes] sendToAI called:", provider, prompt);
        
        // Check WebSocket state
        if (!this.ws || this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
            console.warn("[Hermes] No WebSocket or closed, connecting...");
            this.connectWebSocket();
            // Queue this request
            this.pendingRequests.push({provider, prompt});
            this.showResponse("⚠️ Connecting to Hermes...", "warning");
            return;
        }
        
        const readyState = this.ws.readyState;
        console.log("[Hermes] WebSocket readyState:", readyState, "(0=CONNECTING, 1=OPEN)");
        
        if (readyState === WebSocket.CONNECTING) {
            // Queue and wait - don't spam retries
            console.log("[Hermes] Still connecting, queuing request");
            this.pendingRequests.push({provider, prompt});
            if (this.pendingRequests.length === 1) {
                // Only show message for first queued request
                this.showResponse("⏳ Connecting to Hermes...", "loading");
            }
            return;
        }
        
        if (readyState !== WebSocket.OPEN) {
            console.warn("[Hermes] WebSocket not open (state=" + readyState + ")");
            this.showResponse("❌ WebSocket not connected", "error");
            return;
        }
        
        const icon = provider === "gemini" ? "💚" : "❤️";
        this.showResponse(icon + " Asking " + provider.toUpperCase() + "...", "loading");
        
        const message = JSON.stringify({
            type: "ai_request",
            request_id: Date.now().toString(),
            provider: provider,
            prompt: prompt
        });
        console.log("[Hermes] Sending WebSocket message:", message);
        
        try {
            this.ws.send(message);
            console.log("[Hermes] Message sent successfully");
        } catch (e) {
            console.error("[Hermes] Failed to send message:", e);
            this.showResponse("❌ Failed to send: " + e.message, "error");
        }
    }
    
    // Process any pending requests when connection opens
    processPendingRequests() {
        console.log("[Hermes] Processing", this.pendingRequests.length, "pending requests");
        while (this.pendingRequests.length > 0) {
            const req = this.pendingRequests.shift();
            this.sendToAI(req.provider, req.prompt);
        }
    }
    
    // ========================================================================
    // DOUBLE CLICK HANDLER
    // ========================================================================
    
    handleDoubleClick(event, root) {
        if (!root || !root.camera) {
            console.warn("[Hermes] No root or camera");
            return;
        }
        
        // Get mouse position relative to canvas
        const canvas = root.canvas;
        const rect = canvas.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        
        console.log("[Hermes] Screen coords:", screenX, screenY);
        
        try {
            const worldPos = root.camera.screenToWorld(new shapez.Vector(screenX, screenY));
            console.log("[Hermes] World pos:", worldPos.x, worldPos.y);
            
            const tileX = Math.floor(worldPos.x / shapez.globalConfig.tileSize);
            const tileY = Math.floor(worldPos.y / shapez.globalConfig.tileSize);
            console.log("[Hermes] Tile:", tileX, tileY);
            
            const contents = root.map.getLayersContentsMultipleXY(tileX, tileY);
            console.log("[Hermes] Found", contents.length, "entities at tile");
            
            for (let i = 0; i < contents.length; i++) {
                const entity = contents[i];
                console.log("[Hermes] Checking entity:", entity, entity?.components);
                
                if (entity && entity.components && entity.components.Miner) {
                    console.log("[Hermes] Found miner!");
                    
                    // Try to detect what shape type is below this miner
                    let shapeType = "circle"; // default
                    try {
                        const lowerItem = root.map.getLowerLayerContentXY(tileX, tileY);
                        if (lowerItem && lowerItem.getItemType && lowerItem.getItemType() === "shape") {
                            const def = lowerItem.definition;
                            if (def && def.layers && def.layers[0] && def.layers[0][0]) {
                                shapeType = def.layers[0][0].subShape || "circle";
                                console.log("[Hermes] Detected shape type:", shapeType);
                            }
                        }
                    } catch (e) {
                        console.log("[Hermes] Could not detect shape type:", e);
                    }
                    
                    this.showPromptDialog(null, entity, shapeType);
                    return;
                }
            }
            
            console.log("[Hermes] No miner found at this location");
        } catch (e) {
            console.error("[Hermes] Error handling double click:", e);
        }
    }
    
    // ========================================================================
    // PROMPT DIALOG UI
    // ========================================================================
    
    createPromptDialog() {
        // Create overlay
        const overlay = document.createElement("div");
        overlay.id = "hermes-dialog-overlay";
        overlay.style.cssText = "display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:99999;";
        
        // Create dialog
        const dialog = document.createElement("div");
        dialog.id = "hermes-prompt-dialog";
        dialog.style.cssText = "display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #4ecdc4;border-radius:12px;padding:24px;z-index:100000;min-width:400px;max-width:600px;box-shadow:0 20px 60px rgba(0,0,0,0.5);font-family:sans-serif;";
        
        dialog.innerHTML = '<div style="display:flex;align-items:center;margin-bottom:16px;">' +
            '<span id="hermes-dialog-icon" style="font-size:32px;margin-right:12px;">🤖</span>' +
            '<div><h2 id="hermes-dialog-title" style="margin:0;color:#fff;font-size:18px;">Set Prompt</h2>' +
            '<p style="margin:4px 0 0;color:#888;font-size:12px;">This prompt will be sent when shapes reach the AI Hub. Use painters to choose provider (green=Gemini, red=Claude)</p></div></div>' +
            '<textarea id="hermes-prompt-input" placeholder="Enter your prompt here..." style="width:100%;height:120px;background:#0d1117;border:1px solid #30363d;border-radius:8px;color:#e6edf3;padding:12px;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>' +
            '<p style="margin:8px 0 0;color:#666;font-size:11px;">Press Ctrl+Enter to save, Escape to cancel</p>' +
            '<div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">' +
            '<button id="hermes-cancel-btn" style="padding:10px 20px;background:transparent;border:1px solid #30363d;border-radius:6px;color:#888;cursor:pointer;">Cancel</button>' +
            '<button id="hermes-save-btn" style="padding:10px 24px;background:linear-gradient(135deg,#4ecdc4,#44a08d);border:none;border-radius:6px;color:#fff;cursor:pointer;font-weight:600;">Save Prompt</button></div>';
        
        document.body.appendChild(overlay);
        document.body.appendChild(dialog);
        
        const mod = this;
        
        document.getElementById("hermes-save-btn").onclick = function() {
            const input = document.getElementById("hermes-prompt-input");
            const prompt = input.value.trim();
            if (mod.currentDialogEntity) {
                const entityId = mod.currentDialogEntity.uid;
                const taskInfo = SHAPE_TASK_TYPES[mod.currentShapeType] || SHAPE_TASK_TYPES.circle;
                
                // Store prompt with shape type
                mod.entityPrompts[entityId] = {
                    prompt: prompt,
                    shapeType: mod.currentShapeType
                };
                
                mod.showResponse(`✅ ${taskInfo.icon} ${taskInfo.name} configured!`, "success");
            }
            mod.hidePromptDialog();
        };
        
        document.getElementById("hermes-cancel-btn").onclick = function() {
            mod.hidePromptDialog();
        };
        
        overlay.onclick = function() {
            mod.hidePromptDialog();
        };
        
        // Stop all key events from propagating when dialog is open
        const input = document.getElementById("hermes-prompt-input");
        input.addEventListener("keydown", function(e) {
            e.stopPropagation();
            
            // Ctrl+Enter to save
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                document.getElementById("hermes-save-btn").click();
            }
            // Escape to cancel
            if (e.key === "Escape") {
                mod.hidePromptDialog();
            }
        });
        
        input.addEventListener("keyup", function(e) {
            e.stopPropagation();
        });
        
        input.addEventListener("keypress", function(e) {
            e.stopPropagation();
        });
        
        document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && document.getElementById("hermes-prompt-dialog").style.display !== "none") {
                mod.hidePromptDialog();
            }
        });
    }
    
    currentDialogEntity = null;
    currentShapeType = null;
    
    showPromptDialog(provider, entity, shapeType) {
        this.currentDialogEntity = entity;
        this.currentShapeType = shapeType || "circle";
        
        const dialog = document.getElementById("hermes-prompt-dialog");
        const overlay = document.getElementById("hermes-dialog-overlay");
        const icon = document.getElementById("hermes-dialog-icon");
        const title = document.getElementById("hermes-dialog-title");
        const input = document.getElementById("hermes-prompt-input");
        const description = dialog.querySelector("p");
        
        // Get task info based on shape type
        const taskInfo = SHAPE_TASK_TYPES[this.currentShapeType] || SHAPE_TASK_TYPES.circle;
        
        // Update dialog based on shape/task type
        icon.textContent = taskInfo.icon;
        title.textContent = taskInfo.promptLabel || "Set Prompt";
        input.placeholder = taskInfo.promptPlaceholder || "Enter your prompt here...";
        
        // Update description
        if (description) {
            description.textContent = taskInfo.description + ". Paint shapes green (Gemini) or red (Claude) before delivering to Hub.";
        }
        
        // Update border color based on shape type
        const colors = {
            circle: "#4ecdc4",  // Cyan for iMessage
            rect: "#e94560",    // Red for GitHub
            star: "#f39c12",    // Orange for Cloud
            windmill: "#9b59b6" // Purple for custom
        };
        dialog.style.borderColor = colors[this.currentShapeType] || "#4ecdc4";
        
        // Get existing prompt for this entity if any
        const entityId = entity.uid;
        const existingPrompt = this.entityPrompts[entityId];
        if (typeof existingPrompt === "object") {
            input.value = existingPrompt.prompt || "";
        } else {
            input.value = existingPrompt || "";
        }
        
        overlay.style.display = "block";
        dialog.style.display = "block";
        input.focus();
        
        // Pause the game while dialog is open
        if (this.root && this.root.time) {
            this.wasGamePaused = this.root.time.getIsPaused();
            if (!this.wasGamePaused) {
                this.root.time.performPause();
                console.log("[Hermes] Game paused for prompt dialog");
            }
        }
    }
    
    hidePromptDialog() {
        document.getElementById("hermes-prompt-dialog").style.display = "none";
        document.getElementById("hermes-dialog-overlay").style.display = "none";
        this.currentDialogEntity = null;
        
        // Resume the game if we paused it
        if (this.root && this.root.time && !this.wasGamePaused) {
            this.root.time.performResume();
            console.log("[Hermes] Game resumed after prompt dialog");
        }
        this.wasGamePaused = false;
    }
    
    // ========================================================================
    // RESPONSE DISPLAY (Toast notifications)
    // ========================================================================
    
    // Message history for scrolling through previous messages
    messageHistory = [];
    historyPanelVisible = false;
    
    showResponse(message, type) {
        type = type || "info";
        
        const entry = {
            message: message,
            type: type,
            time: Date.now(),
            duration: type === "ai" ? 10000 : 4000
        };
        
        this.responseQueue.push(entry);
        
        // Add to history (keep last 50)
        this.messageHistory.push(entry);
        while (this.messageHistory.length > 50) {
            this.messageHistory.shift();
        }
        
        // Keep only last 5 in active queue
        while (this.responseQueue.length > 5) {
            this.responseQueue.shift();
        }
        
        this.renderResponses();
        this.updateHistoryButton();
    }
    
    updateResponses() {
        const now = Date.now();
        const before = this.responseQueue.length;
        
        this.responseQueue = this.responseQueue.filter(function(r) {
            return now - r.time < r.duration;
        });
        
        if (this.responseQueue.length !== before) {
            this.renderResponses();
        }
    }
    
    renderResponses() {
        // Remove existing container
        let container = document.getElementById("hermes-responses");
        if (container) {
            container.remove();
        }
        
        if (this.responseQueue.length === 0) return;
        
        // Create container - bottom RIGHT (pointer-events:none so it doesn't block game)
        container = document.createElement("div");
        container.id = "hermes-responses";
        container.style.cssText = "position:fixed;bottom:70px;right:20px;z-index:99998;max-width:450px;pointer-events:none;";
        
        const colors = {
            ai: "#27ae60",
            success: "#2ecc71",
            warning: "#f1c40f",
            error: "#e74c3c",
            loading: "#3498db",
            info: "#34495e"
        };
        
        for (let i = 0; i < this.responseQueue.length; i++) {
            const r = this.responseQueue[i];
            const age = Date.now() - r.time;
            const opacity = Math.max(0.3, 1 - (age / r.duration));
            
            const toast = document.createElement("div");
            toast.style.cssText = "background:" + (colors[r.type] || colors.info) + ";color:#fff;padding:12px 16px;border-radius:8px;margin-bottom:8px;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.3);opacity:" + opacity + ";word-wrap:break-word;";
            toast.textContent = r.message;
            container.appendChild(toast);
        }
        
        document.body.appendChild(container);
    }
    
    updateHistoryButton() {
        let btn = document.getElementById("hermes-history-btn");
        if (!btn) {
            btn = document.createElement("button");
            btn.id = "hermes-history-btn";
            btn.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:100000;background:linear-gradient(135deg,#4ecdc4,#44a08d);border:none;border-radius:50%;width:44px;height:44px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:18px;display:flex;align-items:center;justify-content:center;pointer-events:auto;";
            btn.innerHTML = "📜";
            btn.title = "Message History";
            
            const mod = this;
            btn.onclick = function() {
                mod.toggleHistoryPanel();
            };
            
            document.body.appendChild(btn);
        }
        
        // Update badge count
        const count = this.messageHistory.length;
        btn.innerHTML = count > 0 ? "📜<span style='position:absolute;top:-5px;right:-5px;background:#e74c3c;color:#fff;font-size:10px;padding:2px 5px;border-radius:10px;'>" + count + "</span>" : "📜";
    }
    
    toggleHistoryPanel() {
        this.historyPanelVisible = !this.historyPanelVisible;
        
        let panel = document.getElementById("hermes-history-panel");
        
        if (!this.historyPanelVisible) {
            if (panel) panel.remove();
            return;
        }
        
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "hermes-history-panel";
            panel.style.cssText = "position:fixed;bottom:80px;right:20px;width:400px;max-height:400px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #4ecdc4;border-radius:12px;z-index:100001;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5);font-family:sans-serif;pointer-events:auto;";
            
            // Header
            const header = document.createElement("div");
            header.style.cssText = "padding:12px 16px;border-bottom:1px solid #30363d;display:flex;justify-content:space-between;align-items:center;";
            header.innerHTML = '<span style="color:#fff;font-weight:600;">Message History</span><button id="hermes-history-close" style="background:none;border:none;color:#888;cursor:pointer;font-size:18px;">✕</button>';
            panel.appendChild(header);
            
            // Content - scrollable
            const content = document.createElement("div");
            content.id = "hermes-history-content";
            content.style.cssText = "max-height:340px;overflow-y:auto;padding:8px;pointer-events:auto;";
            panel.appendChild(content);
            
            document.body.appendChild(panel);
            
            const mod = this;
            document.getElementById("hermes-history-close").onclick = function() {
                mod.toggleHistoryPanel();
            };
        }
        
        this.renderHistoryPanel();
    }
    
    renderHistoryPanel() {
        const content = document.getElementById("hermes-history-content");
        if (!content) return;
        
        const colors = {
            ai: "#27ae60",
            success: "#2ecc71",
            warning: "#f1c40f",
            error: "#e74c3c",
            loading: "#3498db",
            info: "#34495e"
        };
        
        content.innerHTML = "";
        
        if (this.messageHistory.length === 0) {
            content.innerHTML = '<div style="color:#888;text-align:center;padding:20px;">No messages yet</div>';
            return;
        }
        
        // Show messages in reverse order (newest first)
        for (let i = this.messageHistory.length - 1; i >= 0; i--) {
            const r = this.messageHistory[i];
            const timeStr = new Date(r.time).toLocaleTimeString();
            
            const item = document.createElement("div");
            item.style.cssText = "background:" + (colors[r.type] || colors.info) + ";color:#fff;padding:10px 12px;border-radius:6px;margin-bottom:6px;font-size:13px;word-wrap:break-word;";
            item.innerHTML = '<div style="font-size:10px;opacity:0.7;margin-bottom:4px;">' + timeStr + '</div>' + this.escapeHtml(r.message);
            content.appendChild(item);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
