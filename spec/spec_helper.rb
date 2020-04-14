require 'bundler/setup'
require 'selenium-webdriver'
require 'rspec'
require 'rspec-steps'
require 'capybara/rspec'
require 'true_automation/rspec'
require 'true_automation/driver/capybara'

options = Selenium::WebDriver::Chrome::Options.new

options.add_preference(:download, directory_upgrade: true,
                       prompt_for_download: false,
                       default_directory: Dir.pwd)

options.add_preference(:browser, set_download_behavior: {behavior: 'allow'})

RSpec.configure do |config|
  Capybara.register_driver :true_automation_driver do |app|

    driver = TrueAutomation::Driver::Capybara.new(app, options: options)

    bridge = driver.browser.send(:bridge)

    path = '/session/:session_id/chromium/send_command'
    path[':session_id'] = bridge.session_id

    bridge.http.call(:post, path, cmd: 'Page.setDownloadBehavior',
                     params: {
                         behavior: 'allow',
                         downloadPath: Dir.pwd})
    driver

  end

  Capybara.configure do |capybara|
    capybara.run_server = false
    capybara.default_max_wait_time = 5

    capybara.default_driver = :true_automation_driver
  end

  config.include Capybara::DSL
  config.include TrueAutomation::DSL
end
