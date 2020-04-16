require 'bundler/setup'
require 'selenium-webdriver'
require 'rspec'
require 'rspec-steps'
require 'capybara/rspec'

options = Selenium::WebDriver::Chrome::Options.new
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-gpu')
options.add_argument('--disable-popup-blocking')

RSpec.configure do |config|
  Capybara.register_driver :driver do |app|
    Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
  end

  Capybara.configure do |capybara|
    capybara.run_server = false
    capybara.default_max_wait_time = 5

    capybara.default_driver = :driver
  end

  config.include Capybara::DSL
end
